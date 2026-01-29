import React from 'react';
import { useNavigate } from 'react-router';

export const Login = () => {
	const [errorMessage, setErrorMessage] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [username, setUsername] = React.useState('');

	const nav = useNavigate();

	function handleLogin(){
		console.log('login', password, username);
		const userDto = {
			userName: username,
			password: password,
		};
		fetch('/login', { body : JSON.stringify(userDto), method: 'POST' }) // async
			.then(parsedHttpResult => {
				console.log(parsedHttpResult);
				if(parsedHttpResult.ok){
					// passworkd was right
					nav('/conversations');
				}else{
					setErrorMessage('Username or password was incorrect');
				}
			}) // do this after request completes
			.catch(() => setErrorMessage('Failed to log in')); // do this if request failed
		console.log('Completed submitting new user')
	}

	const handleCreateAccount = () => {
		console.log('create account', password, username);
		const userDto = {
			userName: username,
			password: password,
		};
		fetch('/createUser', { body : JSON.stringify(userDto), method: 'POST' }) // async
			.then(parsedHttpResult => {
				console.log('/createUser has completed');
				// still need to parse http body as json if we want
				return parsedHttpResult.json();
			}) // do this after request completes
			.then(jsonResult => { // RestApiAppResponse
				if(jsonResult.status){
					// user has been created
					setPassword('');
					setUsername('');
					setErrorMessage('');
				}else{
					setErrorMessage(jsonResult.message);
				}
			})
			.catch(() => setErrorMessage('Failed to create account')); // do this if request failed
		console.log('Completed submitting new user')
	};

	return (
		<div>
			<h1>Login</h1>
			<div className="login-form">
				<div className="login-row">
					<label>Username</label>
					<input value={username} onChange={e => setUsername(e.target.value)} />
				</div>
				<div className="login-row">
					<label>Password</label>
					<input value={password} type="password" onChange={e => setPassword(e.target.value)} />
				</div >
				<div className="login-row">
					<button onClick={handleLogin} >Log in</button>
					<button onClick={handleCreateAccount}>Create account</button>
				</div>
				{errorMessage}
			</div>
		</div>
	);
};