package hoango.gofitwear.service;

import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.ProductVariant;
import hoango.gofitwear.domain.request.productvariant.ProductVariantRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.product.ProductResponse;
import hoango.gofitwear.domain.response.productvariant.ProductVariantResponse;
import hoango.gofitwear.domain.response.productvariant.ProductVariantSimpleResponse;
import hoango.gofitwear.repository.ProductRepository;
import hoango.gofitwear.repository.ProductVariantRepository;
import hoango.gofitwear.utils.CloudinaryService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public ProductVariantService(
            ProductVariantRepository productVariantRepository,
            ProductRepository productRepository,
            ModelMapper modelMapper,
            CloudinaryService cloudinaryService
    ) {
        this.productVariantRepository = productVariantRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
        this.cloudinaryService = cloudinaryService;
    }

    public ResultPagination getAllProductVariants(Specification<ProductVariant> specification, Pageable pageable) {
        Page<ProductVariant> variants = productVariantRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(variants.getTotalPages());
        meta.setTotal(variants.getTotalElements());

        resultPagination.setMeta(meta);

        List<ProductVariantResponse> variantResponses = new ArrayList<>();
        for (ProductVariant variant : variants.getContent()) {
            ProductVariantResponse response = convertToProductVariantResponse(variant);
            variantResponses.add(response);
        }

        resultPagination.setData(variantResponses);
        return resultPagination;
    }

    public ResultPagination getProductVariantsByProductId(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Page<ProductVariant> variants = productVariantRepository.findByProduct(product, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(variants.getTotalPages());
        meta.setTotal(variants.getTotalElements());

        resultPagination.setMeta(meta);

        List<ProductVariantSimpleResponse> variantResponses = new ArrayList<>();
        for (ProductVariant variant : variants.getContent()) {
            ProductVariantSimpleResponse response = convertToProductVariantSimpleResponse(variant);
            variantResponses.add(response);
        }

        resultPagination.setData(variantResponses);
        return resultPagination;
    }

    public List<ProductVariantSimpleResponse> getAllVariantsByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<ProductVariant> variants = productVariantRepository.findByProduct(product);

        return variants.stream()
                .map(this::convertToProductVariantSimpleResponse)
                .collect(Collectors.toList());
    }

    public ProductVariantResponse getProductVariantById(Long id) {
        Optional<ProductVariant> variantOptional = productVariantRepository.findById(id);
        return variantOptional.map(this::convertToProductVariantResponse).orElse(null);
    }

    public ProductVariantResponse createProductVariant(ProductVariantRequest variantRequest) {
        Product product = productRepository.findById(variantRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if variant with same size and color already exists for this product
        if (productVariantRepository.existsByProductAndSizeAndColor(
                product, variantRequest.getSize(), variantRequest.getColor())) {
            throw new RuntimeException("Product variant with the same size and color already exists");
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(variantRequest.getSize());
        variant.setColor(variantRequest.getColor());
        variant.setPrice(variantRequest.getPrice());
        variant.setImageUrl(variantRequest.getImageUrl());
        variant.setStockQuantity(variantRequest.getStockQuantity());

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return convertToProductVariantResponse(savedVariant);
    }

    public ProductVariantResponse createProductVariant(ProductVariantRequest variantRequest, MultipartFile imageFile) {
        Product product = productRepository.findById(variantRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if variant with same size and color already exists for this product
        if (productVariantRepository.existsByProductAndSizeAndColor(
                product, variantRequest.getSize(), variantRequest.getColor())) {
            throw new RuntimeException("Product variant with the same size and color already exists");
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(variantRequest.getSize());
        variant.setColor(variantRequest.getColor());
        variant.setPrice(variantRequest.getPrice());
        variant.setStockQuantity(variantRequest.getStockQuantity());

        // Upload image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = (String) cloudinaryService.upload(imageFile);
            variant.setImageUrl(imageUrl);
        } else {
            variant.setImageUrl(variantRequest.getImageUrl());
        }

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return convertToProductVariantResponse(savedVariant);
    }

    public ProductVariantResponse updateProductVariant(Long id, ProductVariantRequest variantRequest) {
        Optional<ProductVariant> variantOptional = productVariantRepository.findById(id);

        if (variantOptional.isEmpty()) {
            return null;
        }

        ProductVariant variant = variantOptional.get();
        Product product = productRepository.findById(variantRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if variant with same size and color already exists (excluding current variant)
        Optional<ProductVariant> existingVariant = productVariantRepository.findByProductAndSizeAndColor(
                product, variantRequest.getSize(), variantRequest.getColor());

        if (existingVariant.isPresent() && !existingVariant.get().getVariantId().equals(id)) {
            throw new RuntimeException("Another product variant with the same size and color already exists");
        }

        // Update variant properties
        variant.setProduct(product);
        variant.setSize(variantRequest.getSize());
        variant.setColor(variantRequest.getColor());
        variant.setPrice(variantRequest.getPrice());
        variant.setImageUrl(variantRequest.getImageUrl());
        variant.setStockQuantity(variantRequest.getStockQuantity());

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return convertToProductVariantResponse(updatedVariant);
    }

    public ProductVariantResponse updateProductVariant(Long id, ProductVariantRequest variantRequest, MultipartFile imageFile) {
        Optional<ProductVariant> variantOptional = productVariantRepository.findById(id);

        if (variantOptional.isEmpty()) {
            return null;
        }

        ProductVariant variant = variantOptional.get();
        Product product = productRepository.findById(variantRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if variant with same size and color already exists (excluding current variant)
        Optional<ProductVariant> existingVariant = productVariantRepository.findByProductAndSizeAndColor(
                product, variantRequest.getSize(), variantRequest.getColor());

        if (existingVariant.isPresent() && !existingVariant.get().getVariantId().equals(id)) {
            throw new RuntimeException("Another product variant with the same size and color already exists");
        }

        // Update variant properties
        variant.setProduct(product);
        variant.setSize(variantRequest.getSize());
        variant.setColor(variantRequest.getColor());
        variant.setPrice(variantRequest.getPrice());
        variant.setStockQuantity(variantRequest.getStockQuantity());

        // Upload image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = (String) cloudinaryService.upload(imageFile);
            variant.setImageUrl(imageUrl);
        } else if (variantRequest.getImageUrl() != null) {
            variant.setImageUrl(variantRequest.getImageUrl());
        }

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return convertToProductVariantResponse(updatedVariant);
    }

    public boolean deleteProductVariant(Long id) {
        if (productVariantRepository.existsById(id)) {
            productVariantRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Update stock quantity
    public ProductVariantResponse updateStockQuantity(Long id, Integer quantity) {
        Optional<ProductVariant> variantOptional = productVariantRepository.findById(id);

        if (variantOptional.isEmpty()) {
            return null;
        }

        ProductVariant variant = variantOptional.get();
        variant.setStockQuantity(quantity);

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return convertToProductVariantResponse(updatedVariant);
    }

    // Helper method to convert ProductVariant to ProductVariantResponse
    private ProductVariantResponse convertToProductVariantResponse(ProductVariant variant) {
        ProductVariantResponse response = new ProductVariantResponse();
        response.setVariantId(variant.getVariantId());
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());
        response.setPrice(variant.getPrice());
        response.setImageUrl(variant.getImageUrl());
        response.setStockQuantity(variant.getStockQuantity());

        // Map the product to ProductResponse
        ProductResponse productResponse = modelMapper.map(variant.getProduct(), ProductResponse.class);
        response.setProduct(productResponse);

        return response;
    }

    // Helper method to convert ProductVariant to ProductVariantSimpleResponse
    private ProductVariantSimpleResponse convertToProductVariantSimpleResponse(ProductVariant variant) {
        ProductVariantSimpleResponse response = new ProductVariantSimpleResponse();
        response.setVariantId(variant.getVariantId());
        response.setProductId(variant.getProduct().getProductId());
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());
        response.setPrice(variant.getPrice());
        response.setImageUrl(variant.getImageUrl());
        response.setStockQuantity(variant.getStockQuantity());

        return response;
    }
}
