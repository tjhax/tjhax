import React from 'react';
import { useNavigate } from 'react-router';

export const Conversations = () => {
    const [convos, setConvos] = React.useState([]);
    const nav = useNavigate();

    function loadAllConversations(){
        fetch('/getConversations')
        .then(parsedHttpResult => {
            console.log('/getConversations has completed');
            // still need to parse http body as json if we want
            return parsedHttpResult.json();
        }) // do this after request completes
        .then(jsonResult => { // RestApiAppResponse
            if(jsonResult.status){
                // user has been created
                console.log(jsonResult);
                setConvos(jsonResult.data);
            }else{
                //setErrorMessage(jsonResult.message);
            }
        })
        .catch(() => console.log('Failed to create account')); 
    }

    React.useEffect(() => {
        //here is your listener
        console.log('I am an effect')
        loadAllConversations();
    }, []); //event listener that re-rusn any time and of these values change

    return (
        <div>
            <h1>Conversations</h1>
            <table className='all-conversations'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Message count</th>
                        <th>to</th>
                        <th>from</th>
                    </tr>
                </thead>
                <tbody>
                    {convos.map(convo => (
                        <tr onClick ={() => nav('/conversation/' + convo.conversationId)}>
                            <td>{convo.conversationId}</td>
                            <td>{convo.messageCount}</td>
                            <td>{convo.toId}</td>
                            <td>{convo.fromId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};