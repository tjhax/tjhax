package response;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Map.Entry;

public class CustomHttpResponse {
    public final Map<String, String> headers;
    public final String status;
    public final String version;
    public final String body;

    public CustomHttpResponse(Map<String, String> headers, String status, String version,
                              String body) {
        this.headers = headers;
        this.status = status;
        this.version = version;
        this.body = body;
    }

    // TODO fill this out
    @Override
    public String toString() {

        //formating Http Response
        StringBuilder sb = new StringBuilder();
        sb.append(version).append(' ').append(status).append("\r\n");

        if(!headers.containsKey("Content-Length")) {
            int length = body != null ? body.getBytes(StandardCharsets.UTF_8).length : 0;
            sb.append("Content-Length: ").append(length).append("\r\n");
        }

        //appending any headers
        for (Entry<String, String> header : headers.entrySet()) {
            sb.append(header.getKey()).append(": ").append(header.getValue()).append("\r\n");
        }

        //separating headers from the body
        sb.append("\r\n");

        if (body != null && !body.isEmpty() && !body.isBlank()) {
            sb.append(body);
        }

        System.out.println("Raw http response:");
        return sb.toString();
    }
}
