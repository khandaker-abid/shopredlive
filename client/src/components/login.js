import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Login() {
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [err, setErr] = useState('')
    const nav=useNavigate()
    const validate = async (x) => {
        x.preventDefault()
        try{
            const res = await axios.post('http://localhost:8000/users/verify-login', {email, password})
            if(!res.data.validEmail) setErr("No user with that email address!")
            else if(!res.data.validPassword) setErr("Incorrect password") 
            else {
                nav("/app", {state: {userId: res.data.userId}})
            };
        } catch(error) {
            setErr("Cannot check availabilty right now")
        }
    }
    return(
        <div className="login">
        <h1>Log in</h1>
        {err && <p className="error">{err}</p>}
        <form onSubmit = {validate}>
            <label htmlFor="password">Email Address</label><br></br>
            <input type="text" id="email" name="email" maxLength="100" value={email} onChange={(x) => setEmail(x.target.value)} required></input>
            <label htmlFor="password">Password</label><br></br>
            <input type="text" id="password" name="password" maxLength="100" value={password} onChange={x => setPassword(x.target.value)} required></input>
            <button type="submit">Log In</button>
        </form>
        </div>
    );
}