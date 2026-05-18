import { Outlet, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import type { Screen } from "../lib/data";

export const WalletLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const screen = location.pathname.replace("/", "") as Screen;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Outlet />

            <BottomNav
                screen={screen}
                setScreen={(s) => navigate(`/${s}`)}
                dark={true}
            />
        </div>
    );
};