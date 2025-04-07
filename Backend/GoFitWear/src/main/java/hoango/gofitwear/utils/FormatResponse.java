package hoango.gofitwear.utils;



import hoango.gofitwear.domain.response.ResponseDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class FormatResponse implements ResponseBodyAdvice {
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        // Loại trừ các endpoint liên quan đến Swagger/OpenAPI
        String packageName = returnType.getDeclaringClass().getPackage().getName();
        return !packageName.contains("springdoc") &&
                !packageName.contains("swagger") &&
                !packageName.contains("openapi");
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        // Kiểm tra URI để loại trừ các endpoint của Swagger
        String path = request.getURI().getPath();
        if (path.contains("/v3/api-docs") || path.contains("/swagger-ui")) {
            return body;
        }

        HttpServletResponse httpResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int status = httpResponse.getStatus();

        if (status >= 400) {
            return body;
        } else {
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setStatusCode(status);
            responseDTO.setMessage("API OK");
            responseDTO.setData(body);
            return responseDTO;
        }
    }
}
