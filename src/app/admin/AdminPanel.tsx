import React from 'react';

export default function AdminPanel(
    { logoutCallback }: { logoutCallback: () => void }
) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span>Your centered text here</span>
                <button style={{ marginTop: 16 }} onClick={logoutCallback}>Logout</button>
            </div>
        </div>
    );
}