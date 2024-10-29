
import Nav from "./Nav";
import { Outlet, NavLink } from "react-router-dom";
import 'bootstrap';
import Offcanvas from "../components/Offcanvas";
import { useEffect, useState } from "react";

export default function Layout() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    const handleResize = () =>{
        setIsMobile(window.innerWidth < 992);
    };

    useEffect(()=>{
        window.addEventListener('resize', handleResize);

        //Clenup listener on component unmount
        return ()=>{
            window.removeEventListener('resize', handleResize);
        }
    })

    return (
        <div className="container" >
            {isMobile && <Offcanvas/>}
            <div style={{ display: 'flex' }}>
                <Nav />
                <Outlet />
            </div>
        </div>
    )
}