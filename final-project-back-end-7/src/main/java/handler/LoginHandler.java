package handler;

import dao.AuthDao;
import dao.UserDao;
import dto.AuthDto;
import dto.UserDto;
import org.apache.commons.codec.digest.DigestUtils;
import request.ParsedRequest;
import response.ResponseBuilder;
import response.RestApiAppResponse;

import org.bson.Document;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

// DONE
public class LoginHandler implements BaseHandler {

    private static final long TOKEN_TTL_MS = 24L * 3600_000;
    @Override
    public ResponseBuilder handleRequest(ParsedRequest request) {
        //getting the JSON payload
        String raw = request.getBody();
        Document json;
        try{
            json = Document.parse(raw);
        } catch (Exception e){
            RestApiAppResponse<UserDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(), "Invalid JSON payload"
            );
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }
        //getting the users credentials
        String userName = json.getString("userName");
        String password = json.getString("password");
        if(userName == null || password == null){
            RestApiAppResponse<UserDto> resp = new RestApiAppResponse<>(
                    false,Collections.emptyList(),
                    "userName and password are required"
            );
            return new ResponseBuilder().setStatus("400 Bad Request").setBody(resp);
        }
        //making suer user exists/put in the correct login
        List<UserDto> user = UserDao.getInstance().query("userName", userName);
        String sh = user.get(0).getPassword();
        String ph = DigestUtils.sha256Hex(password);
        if(!ph.equals(sh)){
            RestApiAppResponse<UserDto> resp = new RestApiAppResponse<>(
                    false, Collections.emptyList(),
                    "Invalid credentials"
            );
            return new ResponseBuilder().setStatus("401 Unauthorized").setBody(resp);
        }
        //generating a token for the user to have
        String token = UUID.randomUUID().toString();
        long expires = Instant.now().toEpochMilli() + TOKEN_TTL_MS;
        AuthDto auth = new AuthDto();
        auth.setUserName(userName);
        auth.setHash(token);
        auth.setExpireTime(expires);
        AuthDao.getInstance().put(auth);

        RestApiAppResponse<UserDto> resp = new RestApiAppResponse<>(
                true, user, "0"
        );
        //if build is successful we should set our cookie
        String cookies = String.format("authToken=%s; Max-Age=%d; HttpOnly; Path=/",
                token, TOKEN_TTL_MS/1000);
        return new ResponseBuilder().setStatus("200 OK")
                .setHeaders(Collections.singletonMap("Set-Cookie", cookies)).setBody(resp);
    }
}
