package handler;

import auth.AuthFilter;
import dao.MessageDao;
import dto.MessageDto;
import request.ParsedRequest;
import response.ResponseBuilder;
import response.RestApiAppResponse;

import java.util.Collections;
import java.util.List;

public class GetConversationHandler implements BaseHandler {

    @Override
    public ResponseBuilder handleRequest(ParsedRequest request) {
        AuthFilter.AuthResult auth = AuthFilter.doFilter(request);
        if(!auth.isLoggedIn){
            RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                    false,Collections.emptyList(),"unauthorized");

            return new ResponseBuilder().setStatus("401 Unauthorized").setBody(resp);
        }
        //making sure user is logged in and if not send unauthorized


        //if there is no conversationid there shouldn't be a conversation
        String conversationId = request.getQueryParam("conversationId");
        if(conversationId == null || conversationId.isEmpty()){
            RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(
                    false,Collections.emptyList(),"conversationId is empty");

            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }

        List<MessageDto> messages = MessageDao.getInstance().
                query("conversationId", conversationId);
        RestApiAppResponse<MessageDto> resp = new RestApiAppResponse<>(true, messages, "0");

        //sent to the other user
        return new ResponseBuilder().setStatus("200 OK").setBody(resp);
    }
}
