package dto;

import org.bson.Document;

import java.time.Instant;

public class MessageDto extends BaseDto {

    private String fromId;
    private String toId;
    private String message;
    private Long timestamp;
    private String conversationId;


    public MessageDto() {
        timestamp = Instant.now().toEpochMilli();
    }
    //addding from and toDocument
    @Override
    public void fromDocument(Document document) {
        this.fromId = document.getString("fromId");
        this.toId = document.getString("toId");
        this.conversationId = document.getString("conversationId");
        this.message = document.getString("message");
        this.timestamp = document.getLong("timestamp");


    }

    @Override
    public Document toDocument() {
        Document doc = new Document().append("fromId", fromId)
                .append("toId", toId)
                .append("conversationId", conversationId)
                .append("message", message).append("timestamp", timestamp);
        return doc;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getFromId() {
        return fromId;
    }

    public void setFromId(String fromId) {
        this.fromId = fromId;
    }

    public String getToId() {
        return toId;
    }

    public void setToId(String toId) {
        this.toId = toId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }


}
