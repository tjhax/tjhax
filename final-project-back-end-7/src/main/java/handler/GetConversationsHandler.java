package handler;


import auth.AuthFilter;
import dao.ConversationDao;
import dao.UserDao;
import dto.UserDto;
import dto.ConversationDto;
import request.ParsedRequest;
import response.ResponseBuilder;
import response.RestApiAppResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


public class GetConversationsHandler implements BaseHandler {

    @Override
    public ResponseBuilder handleRequest(ParsedRequest request) {
        AuthFilter.AuthResult auth = AuthFilter.doFilter(request);

        if(!auth.isLoggedIn) {
            RestApiAppResponse<ConversationDto> resp =
                    new RestApiAppResponse<>(false, Collections.emptyList(),
                            "Unauthorized");
            return new ResponseBuilder().setStatus("401 Unauthorized").setBody(resp);
        }
        //if user is not logged in we shouldn't send any messages


        //if user doesn't exist we shouldn't send any messages at all.
        List<UserDto> user = UserDao.getInstance().query("userName", auth.userName);

        if(user.isEmpty()) {
            RestApiAppResponse<ConversationDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(), "User not found");
            return new ResponseBuilder().setStatus("401 Unauthorized").setBody(resp);
        }


        String userName = auth.userName;

        List<ConversationDto> convoTo = ConversationDao.getInstance().query("toId", userName);


        List<ConversationDto> convoFrom = ConversationDao.getInstance().query("fromId", userName);

        //merging the two ids into one chat
        List<ConversationDto> merge = new ArrayList<>(convoTo);
        for(ConversationDto convo : convoFrom) {
            if(!merge.contains(convo)) {
                merge.add(convo);
            }
        }

        RestApiAppResponse<ConversationDto> resp = new RestApiAppResponse<>(true,
                List.copyOf(merge), "0");

        return new ResponseBuilder().setStatus("200 OK").setBody(resp);
    }
}
