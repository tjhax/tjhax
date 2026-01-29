package auth;

import dao.AuthDao;
import dto.AuthDto;
import request.ParsedRequest;

public class AuthFilter {

    public static class AuthResult {
        public boolean isLoggedIn;
        public String userName;
    }

    public static AuthResult doFilter(ParsedRequest parsedRequest) {
        AuthResult authResult = new AuthResult();
        authResult.isLoggedIn = false;

        //extracting the token from either cookie or header
        String token = parsedRequest.getCookieValue("auth");

        if(token == null) {
            token = parsedRequest.getHeaderValue("auth");
        }

        if(token == null) {
            String cookieH = parsedRequest.getHeaderValue("Cookie");
            if(cookieH != null) {
                for (String paid : cookieH.split(";")) {
                    String[] kv = paid.trim().split("=",2);
                    if(kv.length == 2 && kv[0].equals("auth")) {
                        token = kv[1];
                        break;
                    }
                }
            }
        }
        //if there is no token we should return null/not logged in
        if (token == null) {
            return authResult;
        }

        var list = AuthDao.getInstance().query("hash", token);
        if(list.isEmpty()) {
            return authResult;
        }

        //if all is true we are logged in.
        AuthDto auth = list.get(0);
        authResult.isLoggedIn = true;
        authResult.userName = auth.getUserName();
        return authResult;

    }
}
