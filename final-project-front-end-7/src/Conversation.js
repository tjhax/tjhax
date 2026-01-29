import React from 'react';
import { useNavigate, useParams } from "react-router";
import Cookies from 'js-cookie';
import './Conversation.css';

export const Conversation = ({ isLoggedIn }) => {
    const [userName, setUserName] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [messages, setMessages] = React.useState([]);
    const [recipientId, setRecipientId] = React.useState('');
    const [selectedFile, setSelectedFile] = React.useState(null);
    const currentUserID = Cookies.get('userName') || '';
    const nav = useNavigate();

    let params = useParams();
    const isNewConvo = !params.conversationId;

    function loadConversation(){
        if(!params.conversationId){
            return;
        }
        fetch('/getConversation?conversationId' + params.conversationId)
        .then(parsedHttpResult => {
            console.log('/getConversation has completed');
            // still need to parse http body as json if we want
            return parsedHttpResult.json();
        }) // do this after request completes
        .then(jsonResult => { // RestApiAppResponse
            if(jsonResult.status) return;
                // user has been created
                console.log(jsonResult);
                setMessages(jsonResult.data);
                const convos = jsonResult.data.filter(m => m.fromId !== m.toId);
                setMessages(convos);
                const firstMsg = jsonResult.data[0];
                const other = firstMsg.fromId === currentUserID ? firstMsg.toId : firstMsg.fromId;
                setRecipientId(other)
                

        })
        .catch(() => console.log('Failed to create account')); 
    }

    React.useEffect(() => {
            //here is your listener
            console.log('I am an effect on Conversation')
            if(params.conversationId){
                loadConversation();
            }
        }, [params.conversationId]); //event listener that re-runs any time and of these values change


    React.useEffect(() => {
        if(messages.length === 0){
            return;
        }
        //temp
        setUserName(messages[0].toId);
        
    },[messages]);    
    const handleSend = () => {
        if(!recipientId.trim() || (!message.trim() && !selectedFile)) return;
        const formData = new FormData();
        formData.append('toId', recipientId);
        if(message.trim()) formData.append('message', message);
        if(selectedFile) formData.append('image', selectedFile)

            const messageDto = { //MessageDto
                message: message,
                toId: userName,
        };

        const httpSettings = {
            method: 'POST',
            headers: {'Content-Type' : 'application/json' },
            body: JSON.stringify({message, toId: recipientId}),
        };
        fetch('/sendMessage', httpSettings)
            .then(parsedHttpResult => {
                console.log('/sendMessage has completed');
                // still need to parse http body as json if we want
                return parsedHttpResult.json();
            }) // do this after request completes
            .then(jsonResult => { // RestApiAppResponse
                if(jsonResult.status){
                    // user has been created
                    console.log(jsonResult);
                    setMessage('');
                    const newConvoId = jsonResult.data[0].conversationId
                    nav('/conversation/' + newConvoId);
                    loadConversation(); //refresh the visible messages
                    if(jsonResult.data[0].conversationId === newConvoId)
                    {
                        setMessages(prev => [...prev, jsonResult.data[0]])
                    }
                    
                    
                }else{
                    //setErrorMessage(jsonResult.message);
                    
                }
            })
            .catch(() => console.log('Failed to create account')); 
    };

    return ( 
        <div className="messaging-container">
            <h1>Conversation {params.conversationId}</h1>
            <div className="messages">
                {messages.map((message) => (
                    <div 
                    
                    className={`message-wrapper ${
                        message.fromId === currentUserID ? 'sent' : 'received'}`} // creating names for the person so we know whos speaking
                        >
                        <div className="message-content">
                            <div className="sender-label">  
                                {message.fromId === currentUserID ? 'You' : message.fromId}
                                </div> 
                            <div className = "message"> {message.message} {message.imageUrl && <img src={message.imageUrl} alt = "user upload" className="message-image" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
            {isNewConvo && (
                    <div>Username:
                        <input value={userName} onChange={e => setUserName(e.target.value)} />
                    </div>
                )}
            </div>
            <div className="send-container">
                {isNewConvo && ( <input className ="recipient-input"
                placeholder="Recipient user"
                value ={recipientId}
                onChange={e => setRecipientId(e.target.value)} 
                />
                )}
                <textarea
                className="message-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                />
                <input
                type="file"
                className='file-input'
                accept="image/*"
                onChange={e => setSelectedFile(e.target.files[0])} />
                <button className="send-button" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};