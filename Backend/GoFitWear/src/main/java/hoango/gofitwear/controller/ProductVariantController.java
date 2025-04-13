package hoango.gofitwear.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.ProductVariant;
import hoango.gofitwear.domain.request.productvariant.ProductVariantRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import hoango.gofitwear.domain.response.productvariant.ProductVariantSimpleResponse;
import hoango.gofitwear.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-variants")
public class ProductVariantController {

    private final ProductVariantService productVariantService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ProductVariantController(ProductVariantService productVariantService, ObjectMapper objectMapper) {
        this.productVariantService = productVariantService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("")
    public ResponseEntity<ResultPagination> getAllProductVariants(
            @Filter Specification<ProductVariant> specification,
            Pageable pageable
    ) {
        ResultPagination result = productVariantService.getAllProductVariants(specification, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ResultPagination> getProductVariantsByProductId(
            @PathVariable Long productId,
            Pageable pageable
    ) {
        ResultPagination result = productVariantService.getProductVariantsByProductId(productId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/product/{productId}/all")
    public ResponseEntity<List<ProductVariantSimpleResponse>> getAllVariantsByProductId(
            @PathVariable Long productId
    ) {
        List<ProductVariantSimpleResponse> variants = productVariantService.getAllVariantsByProductId(productId);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getProductVariantById(@PathVariable Long id) {
        ProductVariantResponse variantResponse = productVariantService.getProductVariantById(id);

        if (variantResponse != null) {
            return ResponseEntity.ok(variantResponse);
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductVariantResponse> createProductVariant(
            @Valid @RequestBody ProductVariantRequest variantRequest
    ) {
        try {
            ProductVariantResponse createdVariant = productVariantService.createProductVariant(variantRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVariantResponse> createProductVariantWithImage(
            @RequestParam("variant") String variantJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws JsonProcessingException {
        try {
            ProductVariantRequest variantRequest = objectMapper.readValue(variantJson, ProductVariantRequest.class);
            ProductVariantResponse createdVariant = productVariantService.createProductVariant(variantRequest, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductVariantResponse> updateProductVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantRequest variantRequest
    ) {
        try {
            ProductVariantResponse updatedVariant = productVariantService.updateProductVariant(id, variantRequest);

            if (updatedVariant != null) {
                return ResponseEntity.ok(updatedVariant);
            }

            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVariantResponse> updateProductVariantWithImage(
            @PathVariable Long id,
            @RequestParam("variant") String variantJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws JsonProcessingException {
        try {
            ProductVariantRequest variantRequest = objectMapper.readValue(variantJson, ProductVariantRequest.class);
            ProductVariantResponse updatedVariant = productVariantService.updateProductVariant(id, variantRequest, imageFile);

            if (updatedVariant != null) {
                return ResponseEntity.ok(updatedVariant);
            }

            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductVariantResponse> updateStockQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request
    ) {
        Integer quantity = request.get("quantity");

        if (quantity == null || quantity < 0) {
            return ResponseEntity.badRequest().build();
        }

        ProductVariantResponse updatedVariant = productVariantService.updateStockQuantity(id, quantity);

        if (updatedVariant != null) {
            return ResponseEntity.ok(updatedVariant);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductVariant(@PathVariable Long id) {
        boolean deleted = productVariantService.deleteProductVariant(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
