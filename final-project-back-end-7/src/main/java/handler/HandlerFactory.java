package handler;

import request.ParsedRequest;
import response.ResponseBuilder;
import response.RestApiAppResponse;
import dto.UserDto;

import java.util.Collections;


public class HandlerFactory {
    // routes based on the path. Add your custom handlers here
    public static BaseHandler getHandler(ParsedRequest request) {
        String path = request.getPath();

        //the routes for each handler
        if("/createUser".equals(path)) {
            return new CreateUserHandler();
        }

        if("/getConversation".equals(path)) {
            return new GetConversationHandler();
        }

        if("/getConversations".equals(path)) {
            return new GetConversationsHandler();
        }

        if("/sendMessage".equals(path)) {
            return new SendMessageHandler();
        }

        if("/login".equals(path)) {
            return new LoginHandler();
        }
        return new BaseHandler() {
            @Override
            public ResponseBuilder handleRequest(ParsedRequest request) {
                RestApiAppResponse<UserDto> userResp = new RestApiAppResponse<>(
                        false, Collections.emptyList(), "No handler for " + request.getMethod()
                        + " " + request.getPath());
                return new ResponseBuilder().setStatus("404 Not Found").setBody(userResp);
            }
        };
    }

}
