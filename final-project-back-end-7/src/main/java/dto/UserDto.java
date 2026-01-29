package dto;

import org.bson.Document;

public class UserDto extends BaseDto {

    private String userName;
    private String password;
    private Integer totalConversations = 0;
    private Integer messagesSent = 0;
    private Integer messagesReceived = 0;

    public UserDto() {
        super();
    }
    //making sure we are passing in the variables from and toDocument
    @Override
    public void fromDocument(Document document) {
        this.userName = document.getString("userName");
        this.password = document.getString("password");
        this.totalConversations = document.getInteger("totalConversations", 0);
        this.messagesSent = document.getInteger("messagesSent", 0);
        this.messagesReceived = document.getInteger("messagesReceived", 0);
    }

    @Override
    public Document toDocument() {
        Document doc = new Document().append("userName", this.userName)
                .append("password", this.password)
                .append("totalConversations", this.totalConversations)
                .append("messagesSent", this.messagesSent)
                .append("messagesReceived", this.messagesReceived);
        return doc;
    }

    public UserDto(String uniqueId) {
        super(uniqueId);
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public UserDto setPassword(String password) {
        this.password = password;
        return this;
    }

    public Integer getTotalConversations() {
        return totalConversations;
    }

    public UserDto setTotalConversations(Integer totalConversations) {
        this.totalConversations = totalConversations;
        return this;
    }

    public Integer getMessagesSent() {
        return messagesSent;
    }

    public UserDto setMessagesSent(Integer messagesSent) {
        this.messagesSent = messagesSent;
        return this;
    }

    public Integer getMessagesReceived() {
        return messagesReceived;
    }

    public UserDto setMessagesReceived(Integer messagesReceived) {
        this.messagesReceived = messagesReceived;
        return this;
    }
}
