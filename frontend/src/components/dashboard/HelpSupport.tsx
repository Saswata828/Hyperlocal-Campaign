import * as React from 'react';
import { 
  HelpCircle, 
  Mail, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  Star, 
  Plus, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';

export const HelpSupport: React.FC = () => {
  // Chat list with instant answers
  const [chatMessages, setChatMessages] = React.useState([
    { sender: 'AI Assistant', text: 'Hi! Welcome to the AdPulse Enterprise Support desk. How can I help you configure your hyperlocal target campaigns today?' }
  ]);
  const [userMsgName, setUserMsgName] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  // Tickets
  const [tickets, setTickets] = React.useState([
    { id: 'TCK-81', subject: 'Inbound integration delay Salt Lake', priority: 'Medium', status: 'Closed' },
    { id: 'TCK-94', subject: 'Stripe webhook sync parameters', priority: 'High', status: 'Pending' }
  ]);
  const [newSub, setNewSub] = React.useState('');
  const [newPri, setNewPri] = React.useState('Low');
  const [ticketStatus, setTicketStatus] = React.useState<string | null>(null);

  // FAQs Accordion index
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const FAQS_LIST = [
    { q: 'How does hyperlocal target delivery work?', a: 'Based under target GPS branch locations, we synthesize tailored social briefs with specialized tone triggers. Pushed campaigns are delivered directly to neighboring social users matching specified radius offsets (1km - 15km).' },
    { q: 'Are standard API credentials hidden securely?', a: 'Completely. Authentication tokens, client credentials, and LLM orchestration keys are processed exclusively in backend micro-services, shielding security footprints entirely.' },
    { q: 'Can I import store catalog products via excel spreadsheet?', a: 'Absolutely. Go into the Store Catalog page, click on Import CSV list, paste your formatted entries, and our parser will automatically catalog items matching specified schemas.' }
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsgName.trim()) return;

    const copy = [...chatMessages, { sender: 'Merchant Client', text: userMsgName }];
    setChatMessages(copy);
    setUserMsgName('');
    setIsTyping(true);

    setTimeout(() => {
      // Automatic intelligent reply parsing
      let response = 'Thank you for your message. Your inquiry has been logged securely into our ticket dashboard. An associate will reach back in 20 minutes!';
      const txt = userMsgName.toLowerCase();
      if (txt.includes('radius') || txt.includes('distance')) {
        response = 'AdPulse recommends setting a target coverage of 5 kilometers for high consumer density. Lower radius scales result in extremely high CTR conversions!';
      } else if (txt.includes('csv') || txt.includes('import')) {
        response = 'Ensure CSV columns strictly match "Product Name, Category, Price, Discount, Stock" to parse bulk items successfully!';
      } else if (txt.includes('token') || txt.includes('jwt')) {
        response = 'Credentials are encrypted with HS512. Secure Spring Boot payloads are processed securely server-side.';
      }

      setChatMessages([...copy, { sender: 'AI Assistant', text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.trim()) return;

    const newTicket = {
      id: `TCK-${Math.floor(Math.random() * 90) + 10}`,
      subject: newSub,
      priority: newPri,
      status: 'Open'
    };

    setTickets([newTicket, ...tickets]);
    setNewSub('');
    setTicketStatus('Supporting ticket submitted successfully!');
    
    setTimeout(() => {
      setTicketStatus(null);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in" id="help-support-tab-view">
      
      {/* Left side FAQS & Ticket creators */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* FAQs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-50 pb-2.5">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-indigo-500" /> Frequently Asked Inquiries
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-tight">Verify basic configurations, target scopes, and spreadsheet template imports</p>
          </div>

          <div className="space-y-2 select-text">
            {FAQS_LIST.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-2.5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-extrabold text-xs text-slate-800 py-1.5 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-4.5 w-4.5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-90 text-indigo-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-[11.5px] leading-relaxed text-slate-600 mt-1 pl-1 pr-6 font-medium"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets and open inquiries */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-50 pb-2.5">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest">Support Core Tickets List</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-tight">Review official inquiries dispatched to technical admins</p>
          </div>

          <form onSubmit={handleCreateTicket} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Inquiry Brief Subject</label>
              <input
                type="text"
                required
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                placeholder="e.g. Need help with Stripe sync triggers"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Priority</label>
              <div className="flex gap-2">
                <select
                  value={newPri}
                  onChange={(e) => setNewPri(e.target.value)}
                  className="bg-white border border-slate-205 rounded-xl text-xs font-semibold px-2 py-2 flex-grow outline-none cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-75 text-white p-2 px-3.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          {ticketStatus && (
            <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-2.5 rounded-xl text-center text-xs font-extrabold">
              {ticketStatus}
            </div>
          )}

          <div className="space-y-2.5">
            {tickets.map(t => (
              <div key={t.id} className="p-3 bg-slate-55 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{t.id}</span>
                  <div>
                    <h5 className="text-[11.5px] font-extrabold text-slate-750 truncate">{t.subject}</h5>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Priority Level: {t.priority}</span>
                  </div>
                </div>

                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  t.status === 'Closed' 
                    ? 'bg-slate-100 text-slate-500 border-slate-205' 
                    : 'bg-emerald-55 text-emerald-700 border-emerald-150 animate-pulse'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Right side AI Live Chat support interface */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[460px]">
        
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          
          {/* Header */}
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <MessageSquare className="h-4 text-indigo-500" /> Live AI Tech Expert
              </h4>
              <span className="text-[8.5px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-0.5 select-none font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time active desk
              </span>
            </div>
            
            <button 
              onClick={() => setChatMessages([
                { sender: 'AI Assistant', text: 'Thread cleared. How can I assist you with your marketing configuration today?' }
              ])}
              className="text-[9px] text-zinc-400 hover:text-slate-600"
            >
              Clear Log
            </button>
          </div>

          {/* Messages block viewport scrolling list */}
          <div className="flex-grow my-4 space-y-3.5 max-h-[290px] overflow-y-auto pr-1 text-left select-text">
            {chatMessages.map((msg, mIdx) => {
              const isAi = msg.sender === 'AI Assistant';
              return (
                <div key={mIdx} className={`space-y-1 ${isAi ? '' : 'text-right'}`}>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {msg.sender}
                  </span>
                  <div className={`p-3 text-[11px] font-medium leading-relaxed rounded-2xl border ${
                    isAi 
                      ? 'bg-slate-50 border-slate-100 text-slate-800 rounded-tl-none font-medium' 
                      : 'bg-indigo-600 border-transparent text-white rounded-tr-none text-right inline-block max-w-[85%] font-semibold'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">AI Assistant</span>
                <span className="text-[10px] text-slate-400 font-bold italic animate-pulse">Consulting product manuals...</span>
              </div>
            )}
          </div>

          {/* Chat input footer form */}
          <form onSubmit={handleSendChat} className="border-t border-slate-50 pt-3 flex items-center gap-2">
            <input
              type="text"
              value={userMsgName}
              onChange={(e) => setUserMsgName(e.target.value)}
              placeholder="Query ad bounds, spreadsheet imports or JWT configs..."
              className="flex-grow px-3 py-2 border border-slate-205 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={!userMsgName.trim()}
              className="bg-indigo-600 hover:bg-indigo-75 text-white p-2.5 rounded-xl font-bold shadow-md cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
