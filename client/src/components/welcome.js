import { useState } from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

export function Welcome() {
    const nav = useNavigate();
    const login = () => {nav('/login')};
    const guest = () => {nav('/app', {state: {userId: null}})};
    const newUser = () => {nav('/register')};
    return(
        <div id="welcome">
            <h1 className = 'logo' id='title'>Welcome to Shop Red Live!</h1>
            <div>
                <button className="header-buttons" onClick={newUser}>Register as New User</button>
                <button className="header-buttons"  onClick={login}>Login</button>
                <button className="header-buttons"  onClick={guest}>Continue as Guest</button>
            </div>
        </div>
    )
}