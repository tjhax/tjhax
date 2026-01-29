package request;

public class CustomParser {

    // extract java useable values from a raw http request string
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
    // TODO parse headers and cookies
    public static ParsedRequest parse(String request) {

        //splitting the request into lines
        String[] lines = request.split("(\r\n|\r|\n)");
        String requestLine = lines[0];
        String[] requestParts = requestLine.split(" ");
        var result = new ParsedRequest();
        result.setMethod(requestParts[0]);


        //path and query string
        var parts = requestParts[1].split("\\?");
        result.setPath(parts[0]);

        if (parts.length == 2) {
            System.out.println(parts[1]);
            String[] queryParts = parts[1].split("&");
            for (int i = 0; i < queryParts.length; i++) {
                String[] pair = queryParts[i].split("=");
                result.setQueryParam(pair[0], pair[1]);
            }
        }

        int i = 1;
        for (; i < lines.length; i++) {
            String line = lines[i];
            if(line.isEmpty()){
                i++;
                break;
            }
            //if a regular header
            int idx = line.indexOf(":");
            if(idx > 0){
                String name = line.substring(0, idx).trim();
                String value = line.substring(idx+1).trim();
                result.setHeaderValue(name, value);
                //if a cookie header
                if (name.equalsIgnoreCase("Cookie")){
                    for(String cookie : value.split(";")){
                        String[] cookieParts = cookie.trim().split("=", 2);
                        if (cookieParts.length == 2){
                            result.setCookieValue(cookieParts[0].trim(), cookieParts[1].trim());
                        }
                    }
                }
            }
        }

        StringBuilder builder = new StringBuilder();
        for (; i < lines.length; i++) {
            builder.append(lines[i]);
            if(i<lines.length-1) builder.append("\n");
        }
        result.setBody(builder.toString());

        return result;
    }
}
