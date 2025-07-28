import axiosinstance from './axios.js'

function sendMessage(msgobj,msgtxt){
    return axiosinstance.post('sendMessage',{
        chat_id: msgobj.chat.id ,
        text: msgtxt
    })
}

function handlemessage(messageobject){
    const messagetext=messageobject.text ||'';
    if(messagetext[0]==='/')
    {
        const command=messagetext.substr(1)
        switch (command)
        {
            case 'start':
                return sendMessage(messageobject,'Hey im Bot! select the options..')
            default:
                return sendMessage(messageobject,'Hey this command is invalid..')
        }
    }
    else
    {
        return sendMessage(messageobject,messagetext)
    }
}
export default handlemessage;
