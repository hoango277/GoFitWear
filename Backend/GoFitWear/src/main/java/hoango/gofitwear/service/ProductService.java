package hoango.gofitwear.service;

import hoango.gofitwear.domain.Brand;
import hoango.gofitwear.domain.Category;
import hoango.gofitwear.domain.Product;
import hoango.gofitwear.domain.request.product.ProductRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.product.ProductResponse;
import hoango.gofitwear.repository.BrandRepository;
import hoango.gofitwear.repository.CategoryRepository;
import hoango.gofitwear.repository.ProductRepository;
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

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;
    private final ModelMapper modelMapper;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          CloudinaryService cloudinaryService,
                          ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.cloudinaryService = cloudinaryService;
        this.modelMapper = modelMapper;
    }

    public ResultPagination getAllProducts(Specification<Product> specification, Pageable pageable) {
        Page<Product> products = productRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(products.getTotalPages());
        meta.setTotal(products.getTotalElements());

        resultPagination.setMeta(meta);

        List<ProductResponse> productResponses = new ArrayList<>();
        for (Product product : products.getContent()) {
            ProductResponse productResponse = modelMapper.map(product, ProductResponse.class);
            productResponses.add(productResponse);
        }
        resultPagination.setData(productResponses);

        return resultPagination;
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public ProductResponse getProductResponseById(Long id) {
        Optional<Product> productOptional = productRepository.findById(id);
        return productOptional.map(product -> modelMapper.map(product, ProductResponse.class)).orElse(null);
    }

    public ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile) {
        Product product = new Product();
        mapRequestToProduct(product, productRequest);

        // Upload image to Cloudinary if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = (String) cloudinaryService.upload(imageFile);
            product.setImageUrl(imageUrl);
        }

        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductResponse.class);
    }

    public ProductResponse updateProduct(Long id, ProductRequest productRequest, MultipartFile imageFile) {
        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            mapRequestToProduct(product, productRequest);

            // Upload image to Cloudinary if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = (String) cloudinaryService.upload(imageFile);
                product.setImageUrl(imageUrl);
            }

            Product updatedProduct = productRepository.save(product);
            return modelMapper.map(updatedProduct, ProductResponse.class);
        }

        return null;
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            Product product = productRepository.findById(id).get();
            product.setIsDeleted(true);
            productRepository.save(product);
            return true;
        }
        return false;
    }
    public boolean turnOn(Long id) {
        if (productRepository.existsById(id)) {
            Product product = productRepository.findById(id).get();
            product.setIsDeleted(false);
            productRepository.save(product);
            return true;
        }
        return false;
    }

    // Helper method to map request to product
    private void mapRequestToProduct(Product product, ProductRequest productRequest) {
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());

        // Set category
        if (productRequest.getCategoryId() != null) {
            Optional<Category> categoryOptional = categoryRepository.findById(productRequest.getCategoryId());
            categoryOptional.ifPresent(product::setCategory);
        }

        // Set brand
        if (productRequest.getBrandId() != null) {
            Optional<Brand> brandOptional = brandRepository.findById(productRequest.getBrandId());
            brandOptional.ifPresent(product::setBrand);
        }
    }
}
