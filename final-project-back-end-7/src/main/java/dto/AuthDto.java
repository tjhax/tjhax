package dto;

import org.bson.Document;

public class AuthDto extends BaseDto{

    private String userName;
    private Long expireTime;
    private String hash;

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public void setExpireTime(Long expireTime) {
        this.expireTime = expireTime;
    }

    public String getUserName() {
        return userName;
    }

    public Long getExpireTime() {
        return expireTime;
    }

    public String getHash() {
        return hash;
    }

    @Override
    public Document toDocument() {
        Document doc = new Document().append("userName", userName)
                .append("expireTime", expireTime).append("hash", hash);
        return doc;
    }
    //
    public void fromDocument(Document document) {
        this.userName = document.getString("userName");
        this.expireTime = document.getLong("expireTime");
        this.hash = document.getString("hash");
    }
}
