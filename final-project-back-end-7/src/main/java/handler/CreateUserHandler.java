package handler;

import dao.UserDao;
import dto.UserDto;
import org.apache.commons.codec.digest.DigestUtils;
import request.ParsedRequest;
import response.ResponseBuilder;

import response.RestApiAppResponse;

import java.util.Collections;
import java.util.List;


public class CreateUserHandler implements BaseHandler {

    @Override
    public ResponseBuilder handleRequest(ParsedRequest request) {
        UserDto incoming;

        try{
            incoming = handler.GsonTool.GSON.fromJson(request.getBody(), UserDto.class);
        }catch(Exception e){
            RestApiAppResponse<UserDto> resp =
                    new RestApiAppResponse<>(false, Collections.emptyList(),
                            "Invalid Json Payload");
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }

        //getting users cookies
        String userName = incoming.getUserName();
        String password = incoming.getPassword();

        //making sure username and password are correct
        if (userName == null || userName.isEmpty() || password == null || password.isEmpty()) {
            RestApiAppResponse<UserDto> resp =
                    new RestApiAppResponse<>(false, Collections.emptyList(),
                            "userName and password are required");
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }
        //making sure the user exists already
        List<UserDto> exists = UserDao.getInstance().query("userName", userName);
        if (!exists.isEmpty()) {
            RestApiAppResponse<UserDto> resp =
                    new RestApiAppResponse<>(false, Collections.emptyList(),
                            "User '" + userName + "' already exists");
            return new ResponseBuilder().setStatus("409 Conflict").setBody(resp);
        }

        //creating new user if not
        String hash = DigestUtils.sha256Hex(password);
        UserDto created = new UserDto();
        created.setUserName(userName);
        created.setPassword(hash).setTotalConversations(0).setMessagesSent(0)
                .setMessagesReceived(0);
        UserDao.getInstance().put(created);

        RestApiAppResponse<UserDto> resp =
                new RestApiAppResponse<>(true, List.of(created),
                        "0");
        //user has been created
        return new ResponseBuilder().setStatus("200 OK").setBody(resp);
    }
}