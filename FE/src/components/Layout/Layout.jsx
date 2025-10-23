import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen"
            style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Sidebar collapsed={collapsed} />
            <div
                className="transition-all duration-300"
                style={{
                    marginLeft: collapsed ? '5rem' : '16rem',
                    width: collapsed ? 'calc(100% - 5rem)' : 'calc(100% - 16rem)'
                }}
            >
                <div className="sticky top-0 z-10">
                    <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                </div>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
