package hoango.gofitwear.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.turkraft.springfilter.boot.Filter;
import hoango.gofitwear.domain.Brand;
import hoango.gofitwear.domain.request.BrandRequest;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.brand.BrandResponse;
import hoango.gofitwear.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;
    private final ObjectMapper objectMapper;

    @Autowired
    public BrandController(BrandService brandService, ObjectMapper objectMapper) {
        this.brandService = brandService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("")
    public ResponseEntity<ResultPagination> getAllBrands(
            @Filter Specification<Brand> specification,
            Pageable pageable
    ) {
        ResultPagination result = brandService.getAllBrands(specification, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/dropdown")
    public ResponseEntity<List<BrandResponse>> getAllBrandsForDropdown() {
        List<BrandResponse> brands = brandService.getAllBrandsForDropdown();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable Long id) {
        BrandResponse brandResponse = brandService.getBrandById(id);

        if (brandResponse != null) {
            return ResponseEntity.ok(brandResponse);
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(@RequestBody BrandRequest brandRequest) {
        BrandResponse createdBrand = brandService.createBrand(brandRequest);

        if (createdBrand != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBrand);
        }

        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @RequestBody BrandRequest brandRequest
    ) {
        BrandResponse updatedBrand = brandService.updateBrand(id, brandRequest);

        if (updatedBrand != null) {
            return ResponseEntity.ok(updatedBrand);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        boolean deleted = brandService.deleteBrand(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.badRequest().build();
    }
}
