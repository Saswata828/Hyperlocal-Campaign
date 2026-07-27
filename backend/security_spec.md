# Security Specification & Threat Model (Red Team TDD Spec)

## 1. Data Invariants
- **Authentication**: All writes (and non-public reads) require a fully signed-in user (`request.auth != null`) whose email must be verified (`request.auth.token.email_verified == true`).
- **Data Isolation**: A user can only view, create, edit, or delete items owned by them (`userId == request.auth.uid` or `ownerId == request.auth.uid`). No member of a tenant can access another merchant's stores, products, campaigns, leads, or notifications.
- **Strict Fields**: System timestamps such as `createdAt` must be set via `request.time` on create, and `updatedAt` must match `request.time` on edits. ID keys must be alphanumeric strings bounded to prevent DOS/OOM storage payloads.

## 2. The "Dirty Dozen" Payloads (Security Attack Vectors)

Here are the 12 attack vectors designed to fail authorization validations:

### Attack 1: User Profile Identity Theft (Spoofing UID)
- **Target Collection**: `/users/legitimate_user_id`
- **Malicious Payload**:
```json
{
  "businessName": "Hacked Inc.",
  "ownerName": "Attacker",
  "email": "attacker@fraud.com",
  "mobileNumber": "0000000000",
  "ownerId": "legitimate_user_id"
}
```
- **Reason to Deny**: Denied because the user attempts to write into a profile which does not match their verified `auth.uid`.

### Attack 2: Self-Promotion to Admin (Privilege Escalation)
- **Target Collection**: `/users/attacker_uid`
- **Malicious Payload**:
```json
{
  "businessName": "Attacker Store",
  "ownerName": "Attacker",
  "email": "attacker@val.com",
  "mobileNumber": "9876543210",
  "gstin": "27AAAAA1111A1Z1",
  "role": "admin",
  "isAdmin": true
}
```
- **Reason to Deny**: Profile validation denies unmapped key fields (`role` and `isAdmin`) which are not present in the schema definition.

### Attack 3: Spoofing Owner ID on Store Branch Setup (Resource Hijacking)
- **Target Collection**: `/stores/new_store_123`
- **Malicious Payload**:
```json
{
  "id": "new_store_123",
  "name": "Attacker Storefront",
  "address": "123 Fraud Lane",
  "phone": "+91 99999 99999",
  "category": "SaaS",
  "hours": "24/7",
  "radiusTargetKm": 5,
  "status": "Active",
  "ownerId": "victim_user_uid"
}
```
- **Reason to Deny**: Denied because the payload assigns `ownerId` to a victim user instead of matching the authenticated user's UID.

### Attack 4: Denial of Wallet via Giant Document Key Poisoning
- **Target Collection**: `/stores/very_long_garbage_key_representing_a_massive_dos_attack_sequence_with_hundreds_of_symbols_that_tries_to_poison_firestore_indexes`
- **Malicious Payload**: Standard schema payload.
- **Reason to Deny**: Rejected by `isValidId()` check limiting document ID key sizes to max 128 characters of strict regex alphanumeric characters.

### Attack 5: Poisoning Stock Counts (Integer Boundary Leak)
- **Target Collection**: `/products/prod_abc123`
- **Malicious Payload**:
```json
{
  "id": "prod_abc123",
  "name": "Organic Juice",
  "category": "Beverage",
  "price": 12.50,
  "discount": 0,
  "stock": -9999999,
  "image": "https://img.png",
  "status": "In Stock",
  "ownerId": "attacker_uid"
}
```
- **Reason to Deny**: Out-of-bounds integer boundary violation on stock value (`stock` must be `>= 0`).

### Attack 6: Unauthenticated Campaign Read Scraping
- **Target Collection**: `/campaigns` (Listing query)
- **Malicious Request**: Anonymous or regular user searching all lists.
- **Reason to Deny**: Denied because `allow list` requires authenticated requests filtering results to matching owner ID `resource.data.ownerId == request.auth.uid`.

### Attack 7: Modifying Immutable Campaign Associations
- **Target Collection**: `/campaigns/camp_123`
- **Malicious Update Payload**:
```json
{
  "id": "camp_123",
  "name": "Cheating Campaign",
  "goal": "Fraud",
  "festival": "Christmas",
  "audience": "Everyone",
  "radiusKm": 10,
  "budget": 200,
  "offer": "Free",
  "tone": "Casual",
  "platforms": ["Facebook"],
  "status": "Active",
  "reach": 100,
  "engagement": 10,
  "leads": 2,
  "roi": 15,
  "startDate": "2026-12-25",
  "ownerId": "stolen_owner_uid"
}
```
- **Reason to Deny**: Denied on update because setting a different ownerId is forbidden (`incoming().ownerId == existing().ownerId`).

### Attack 8: Mutating Campaigns Locked in Terminal "Completed" State
- **Target Collection**: `/campaigns/camp_completed_123`
- **Malicious Update Payload**: Changing budget on a `status = 'Completed'` campaign.
- **Reason to Deny**: Campaign state lock down blocks updates to documents where `existing().status == 'Completed'`.

### Attack 9: Social Media Spammer Attack via Platform Array Poisoning
- **Target Collection**: `/campaigns/camp_123`
- **Malicious Payload**: Including over 100 fake social platforms in `platforms` array.
- **Reason to Deny**: Array validation requires platform arrays to be locked to a reasonable max-size count (`platforms.size() <= 10`).

### Attack 10: Lead Spammer Injection (Stealing Source Analytics)
- **Target Collection**: `/leads/lead_fraud`
- **Malicious Payload**:
```json
{
  "id": "lead_fraud",
  "name": "John Doe",
  "email": "spam@mail.com",
  "phone": "9999999999",
  "source": "AI-Studio-Spam-Bot-Network-V7",
  "status": "New",
  "inquiry": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  "date": "2026-05-22",
  "ownerId": "victim_uid"
}
```
- **Reason to Deny**: Owner ID mismatch validation blocks writing leads into a victim's pipeline.

### Attack 11: Fake Verification Token Bypass (Email Unverified Trick)
- **Request Profile**: Authed user with email verification claim `email_verified == false`.
- **Target Collection**: `/stores/store_abc` (Create)
- **Reason to Deny**: Denied because write operations require `request.auth.token.email_verified == true`.

### Attack 12: Injecting Shadow Keys in Notifications
- **Target Collection**: `/notifications/not_123`
- **Malicious Payload**:
```json
{
  "id": "not_123",
  "title": "Alert",
  "message": "Trigger",
  "type": "alert",
  "timestamp": "2026-05-22T05:00:00Z",
  "read": false,
  "ownerId": "attacker_uid",
  "ghost_malicious_key": "shadow_value"
}
```
- **Reason to Deny**: Strict property checking (`keys().size() == 7`) blocks shadow entries.

---

## 3. The Test Runner Structure
The firestore test framework structure should assert:
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Fortress Security Rules Unit Test Suite', () => {
  it('prevents Attack #1: Profile theft', async () => {
    // initialize malicious db context
    // assertFails(setDoc(profile_ref, mal_payload))
  });
  // ... maps and evaluates all 12 attacks properly
});
```
