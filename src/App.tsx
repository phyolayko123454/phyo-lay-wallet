import React, { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedOp, setSelectedOp] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  // Telegram ချိတ်ဆက်မှု
  const sendOrder = async () => {
    const token = "8593768099:AAFJ7DVSy0XGSzPB8vmztX909ayKNrBnn1g";
    const chatid = "7368604341";
    const text = `🔔 Order New!\nOperator: ${selectedOp}\nPhone: ${phone}\nAmount: ${amount}`;
    
    await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${encodeURIComponent(text)}`);
    alert("အော်ဒါတင်ပြီးပါပြီ။ Telegram သို့ ပို့လိုက်ပါပြီ!");
    setPage('home');
  };

  return (
    <div style={{ background: '#121212', color: '#d4af37', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      {page === 'home' && (
        <div style={{ textAlign: 'center' }}>
          <h1>PHYO LAY WALLET</h1>
          <button onClick={() => setPage('topup')} style={{ background: '#d4af37', padding: '15px 40px', fontSize: '20px', margin: '20px', borderRadius: '10px' }}>TOP UP</button>
          <button onClick={() => setPage('admin')} style={{ background: 'gray', padding: '10px 20px', display: 'block', margin: 'auto' }}>ADMIN</button>
        </div>
      )}

      {page === 'topup' && (
        <div style={{ textAlign: 'center' }}>
          <h2>Select Operator</h2>
          {['MPT', 'ATOM', 'Ooredoo', 'Mytel', 'AIS', 'DTAC', 'TrueMove'].map(op => (
            <button key={op} onClick={() => { setSelectedOp(op); setPage('form'); }} style={{ background: '#333', color: 'gold', padding: '15px', margin: '10px', width: '120px', border: '1px solid gold' }}>
              {op}
            </button>
          ))}
          <button onClick={() => setPage('home')} style={{ display: 'block', margin: '20px auto' }}>Back</button>
        </div>
      )}

      {page === 'form' && (
        <div style={{ textAlign: 'center', maxWidth: '300px', margin: 'auto' }}>
          <h2>{selectedOp} Top-up</h2>
          <input placeholder="Phone Number" onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
          <input placeholder="Amount" onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
          <button onClick={sendOrder} style={{ background: 'gold', padding: '10px 20px', width: '100%' }}>Confirm Order</button>
          <button onClick={() => setPage('topup')} style={{ margin: '10px' }}>Back</button>
        </div>
      )}

      {page === 'admin' && (
        <div style={{ textAlign: 'center' }}>
          <h2>Admin Login</h2>
          <p>User: hsthst12 / Pass: 121212</p>
          <button onClick={() => setPage('home')}>Back</button>
        </div>
      )}
    </div>
  );
                                                           }
                                                                                        
