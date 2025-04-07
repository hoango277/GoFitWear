package hoango.gofitwear.domain.response;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultPagination {
    private Meta meta;
    private Object data;
}
