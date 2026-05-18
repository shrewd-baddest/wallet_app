import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export const WalletLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Outlet />
            <BottomNav />
        </div>
    );
};
