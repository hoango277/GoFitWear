package hoango.gofitwear.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.request.product.ProductRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.product.ProductResponse;
import hoango.gofitwear.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ProductController(ProductService productService, ObjectMapper objectMapper) {
        this.productService = productService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("")
    public ResponseEntity<ResultPagination> getAllProducts(
            @Filter Specification<Product> specification,
            Pageable pageable
    ) {
        ResultPagination result = productService.getAllProducts(specification, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse productResponse = productService.getProductResponseById(id);

        if (productResponse != null) {
            return ResponseEntity.ok(productResponse);
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestParam("product") String productJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws JsonProcessingException {
        ProductRequest productRequest = objectMapper.readValue(productJson, ProductRequest.class);
        ProductResponse createdProduct = productService.createProduct(productRequest, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestParam("product") String productJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws JsonProcessingException {
        ProductRequest productRequest = objectMapper.readValue(productJson, ProductRequest.class);
        ProductResponse updatedProduct = productService.updateProduct(id, productRequest, imageFile);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
