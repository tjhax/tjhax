package handler;

import auth.AuthFilter;
import dao.MessageDao;
import dao.UserDao;
import dto.MessageDto;
import dto.UserDto;
import request.ParsedRequest;
import response.ResponseBuilder;
import response.RestApiAppResponse;

import org.bson.Document;
import java.util.Collections;
import java.util.List;
// Done
public class SendMessageHandler implements BaseHandler {

    @Override
    public ResponseBuilder handleRequest(ParsedRequest request) {
        //if user is not logged in we shouldn't be sending messages
        AuthFilter.AuthResult auth = AuthFilter.doFilter(request);
        if(!auth.isLoggedIn){
            RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(), "Unauthorized");

            return new ResponseBuilder().setStatus("401 Unauthorized").setBody(resp);
        }
        String fromId = auth.userName;


        //parsing json payload
        String raw = request.getBody();
        Document json;
        try{
            json = Document.parse(raw);
        } catch (Exception e){
            RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(),
                    "Invalid JSON payload"
            );
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }

        //extracting the messages
        String toId = json.getString("toId");
        String text = json.getString("message");

        //if there is no message or id we shouldn't be able to send a message as well
        if (toId == null || toId.isBlank() || text == null || text.isBlank()) {
            RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(),
                    "toId and non-empty message are required"
            );
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }

        String convoId = dto.ConversationDto.makeUniqueId(fromId, toId);
        MessageDto msg = new MessageDto();
        msg.setFromId(fromId);
        msg.setToId(toId);
        msg.setMessage(text);
        msg.setConversationId(convoId);


        MessageDao.getInstance().put(msg);

        //incrementing the messages the user has received
        List<UserDto> rList = UserDao.getInstance().query("userName", toId);
        if(!rList.isEmpty()){
            UserDto user = rList.get(0);
            user.setMessagesReceived(user.getMessagesReceived() + 1);
            UserDao.getInstance().put(user);
        }
        //incrementing the amount of messages that has been sent
        List<UserDto> sList = UserDao.getInstance().query("userName", fromId);
        if(!sList.isEmpty()){
            UserDto user = sList.get(0);
            user.setMessagesSent(user.getMessagesSent() + 1);
            UserDao.getInstance().put(user);
        }

        //message has been sent
        RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                true, List.of(msg),"0"
        );
        return new ResponseBuilder().setStatus("200 OK").setBody(resp);
    }
}
