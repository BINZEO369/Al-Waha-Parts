'use client';

import { FormEvent, useState } from 'react';

const WHATSAPP = '966533866922';
const PHONE = '0533866922';
const EMAIL = 'hello.alwaha@proton.me';
const topics = ['Part availability', 'Vehicle fitment', 'Booking support', 'General question'];

export default function MessagesPage() {
  const [topic, setTopic] = useState(topics[0] ?? 'General question');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = ['Hello Al Waha Parts,', `Name: ${name}`, `Phone: ${phone}`, `Topic: ${topic}`, `Message: ${message}`].join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(payload)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
  }

  return (
    <main className="simple-messages-page">
      <style>{`
        .simple-messages-page { min-height: calc(100vh - 125px); color: #111; background: #fff; }
        .simple-messages { width: min(680px, 100%); min-height: calc(100vh - 125px); margin: 0 auto; padding: 38px 24px 30px; display: flex; flex-direction: column; }
        .simple-profile { display: flex; align-items: center; gap: 12px; }
        .simple-avatar { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; border-radius: 50%; color: #fff; background: #111; font-size: 10px; font-weight: 800; }
        .simple-profile strong, .simple-profile small { display: block; }
        .simple-profile strong { font-size: 15px; letter-spacing: -.04em; }
        .simple-profile small { margin-top: 4px; color: #999; font-size: 10px; }
        .simple-actions { display: flex; gap: 16px; margin-left: auto; }
        .simple-actions a, .simple-actions button { padding: 0; border: 0; color: #111; background: transparent; font-size: 11px; text-decoration: none; cursor: pointer; }
        .simple-actions a:hover, .simple-actions button:hover { text-decoration: underline; }
        .simple-intro { margin-top: 62px; }
        .simple-intro h1 { max-width: 560px; margin: 0; font-size: clamp(34px, 6vw, 52px); line-height: 1.08; letter-spacing: -.07em; font-weight: 500; }
        .simple-intro p { max-width: 500px; margin: 13px 0 0; color: #888; font-size: 12px; line-height: 1.7; }
        .simple-thread { flex: 1; padding: 52px 0 22px; }
        .simple-thread-meta { margin-bottom: 17px; color: #aaa; font: 9px 'DM Mono', monospace; letter-spacing: .12em; text-transform: uppercase; }
        .simple-message { max-width: 510px; color: #222; font-size: 14px; line-height: 1.75; }
        .simple-message-author { display: block; margin-bottom: 7px; color: #aaa; font-size: 10px; }
        .simple-user-message { max-width: 470px; margin: 31px 0 0 auto; padding: 16px 19px; border-radius: 18px 18px 3px 18px; color: #fff; background: #111; font-size: 13px; line-height: 1.65; }
        .simple-user-message small { display: block; margin-bottom: 5px; color: #aaa; font-size: 9px; }
        .simple-dots { display: flex; gap: 5px; margin-top: 27px; }
        .simple-dots i { width: 8px; height: 8px; border-radius: 50%; background: #111; opacity: .25; }
        .simple-dots i:nth-child(2) { opacity: .5; }
        .simple-dots i:nth-child(3) { opacity: .8; }
        .simple-composer { margin-top: auto; }
        .simple-topics { display: flex; gap: 15px; overflow-x: auto; margin-bottom: 10px; padding-bottom: 4px; }
        .simple-topics button { flex: 0 0 auto; padding: 0; border: 0; color: #999; background: transparent; font-size: 10px; cursor: pointer; }
        .simple-topics button.active, .simple-topics button:hover { color: #111; text-decoration: underline; text-underline-offset: 4px; }
        .simple-form-box { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 14px; padding: 15px 17px 13px; border-radius: 17px; background: #f5f5f5; }
        .simple-field { display: grid; gap: 3px; }
        .simple-field label { color: #999; font: 8px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .1em; }
        .simple-field input, .simple-field textarea { width: 100%; padding: 6px 0; border: 0; border-bottom: 1px solid #ccc; outline: 0; color: #111; background: transparent; font: inherit; font-size: 11px; }
        .simple-field textarea { grid-column: 1 / -1; min-height: 30px; max-height: 80px; resize: vertical; }
        .simple-field input:focus, .simple-field textarea:focus { border-bottom-color: #111; }
        .simple-send { grid-column: 1 / -1; display: grid; place-items: center; width: 38px; height: 38px; justify-self: end; margin-top: -43px; border: 0; border-radius: 10px; color: #fff; background: #111; font-size: 21px; line-height: 1; cursor: pointer; }
        .simple-send:hover { background: #333; }
        .simple-success { margin-bottom: 10px; color: #111; font-size: 10px; }
        .simple-disclaimer { margin: 16px 0 0; color: #aaa; font-size: 9px; text-align: center; }
        @media (max-width: 560px) { .simple-messages { padding: 25px 17px 22px; } .simple-actions a, .simple-actions button { font-size: 0; } .simple-actions a:before { content: '☎'; font-size: 16px; } .simple-actions button:before { content: '•••'; font-size: 16px; } .simple-intro { margin-top: 47px; } .simple-thread { padding-top: 42px; } .simple-message { font-size: 13px; } }
      `}</style>
      <div className="simple-messages">
        <header className="simple-profile"><span className="simple-avatar">AW</span><div><strong>Al Waha Parts</strong><small>Parts desk · available for support</small></div><nav className="simple-actions" aria-label="Contact actions"><a href={`tel:+${WHATSAPP}`}>Call</a><a href={`mailto:${EMAIL}`}>Email</a><button type="button" aria-label="More contact options">•••</button></nav></header>
        <section className="simple-intro"><h1>Hey, I&apos;m Al Waha Parts. What do you want help with?</h1><p>Tell us the car brand, model, year and part you need. You can attach a clear photo after continuing to WhatsApp.</p></section>
        <section className="simple-thread" aria-live="polite"><div className="simple-thread-meta">Today · Al Waha Parts desk</div><div className="simple-message"><span className="simple-message-author">Al Waha Parts</span>Hi. I can help you find the right part, check vehicle fitment, or prepare a booking request.</div>{message ? <div className="simple-user-message"><small>You · {topic}</small>{message}</div> : <div className="simple-dots" aria-label="Ready for your message"><i /><i /><i /></div>}</section>
        <section className="simple-composer"><div className="simple-topics" role="group" aria-label="Message topic">{topics.map((item) => <button className={topic === item ? 'active' : ''} key={item} type="button" onClick={() => setTopic(item)}>{item}</button>)}</div>{sent && <div className="simple-success" role="status">WhatsApp opened. Review your message and attach a photo before sending.</div>}<form className="simple-form-box" onSubmit={submit}><div className="simple-field"><label htmlFor="simple-name">Name</label><input id="simple-name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your name" /></div><div className="simple-field"><label htmlFor="simple-phone">Phone</label><input id="simple-phone" value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="05…" /></div><div className="simple-field"><label htmlFor="simple-text">Reply</label><textarea id="simple-text" value={message} onChange={(event) => setMessage(event.target.value)} required placeholder="Write a message…" /></div><button className="simple-send" type="submit" aria-label="Send message">↑</button></form><p className="simple-disclaimer">Al Waha Parts may make mistakes. Verify vehicle and part information before ordering.</p></section>
      </div>
    </main>
  );
}
