import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Login } from './login';

export function Register() {
    const [first, setFirst] = useState('')
    const [last, setLast] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [img, setImg] = useState(null)
    const [err, setErr] = useState('')
    const [button, setButton] = useState('')
    const nav=useNavigate()
    const validate = x => {
        x.preventDefault();
        setErr('');
        if(password != password2) {
            setErr("Passwords are different!!")
        } else if(!(email.includes('@') && email.includes('.'))) { //should have more cases
            setErr("The email address is in incorrect format.")
        } else if(password.includes(first) || password.includes(last) || password.includes(username) || password.includes(email.substring(0, email.indexOf('@')))) {
            setErr("The password cannot contain your name, email, or username.")
        } else {
            const check = async() => {
                try{
                    const res = await axios.get('http://localhost:8000/users/verify', {params: {name: username, email: email}})
                    if(!res.data.ans) submit(x);
                    else setErr("Username or email address already taken.")
                } catch(error) {
                    setErr("Cannot check availabilty right now")
                }
            }
            check();
        }
    }
    const submit = async (x) => {
        x.preventDefault();
        setErr('');
        try {
            const res = await axios.post("http://localhost:8000/register", {first, last, username, email, password, img})
            console.log("e")
            nav("/login")
        } catch (error) {
            console.error("Can't register", error)
        }
    }
    return(
        <div className="register">
        <h1>Register</h1>
        {err && <p className="error">{err}</p>}
        <form onSubmit = {validate}>
            <label htmlFor="first">First Name</label><br></br>
            <input type="text" id="first-name" name="first-name" maxLength="100" value={first} onChange={x => setFirst(x.target.value)} required></input>
            <label htmlFor="last">Last Name</label><br></br>
            <input type="text" id="last-name" name="last-name" maxLength="100" value={last} onChange={x => setLast(x.target.value)} required></input>
            <label htmlFor="username">Email Address</label><br></br>
            <input type="text" id="email" name="email" maxLength="100" value={email} onChange={x => setEmail(x.target.value)} required></input>
            <label htmlFor="password">Username</label><br></br>
            <input type="text" id="username" name="username" maxLength="100" value={username} onChange={x => setUsername(x.target.value)} required></input>
            <label htmlFor="password">Password</label><br></br>
            <input type="text" id="password" name="password" maxLength="100" value={password} onChange={x => setPassword(x.target.value)} required></input>
            <label htmlFor="password">Put it again:</label><br></br>
            <input type="text" id="password2" name="password2" maxLength="100" value={password2} onChange={x => setPassword2(x.target.value)} required></input>
            <label htmlFor="img">Create a profile picture (optional):</label><br></br>
            <input type="file" id="img" name="img" accept="image/*" value={img} onChange={x => setImg(x)}></input>
            <button type="submit">Sign Up</button>
            {button}
        </form>
        </div>
    );
}