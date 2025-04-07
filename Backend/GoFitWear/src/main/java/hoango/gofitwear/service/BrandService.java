package hoango.gofitwear.service;

import hoango.gofitwear.domain.Brand;
import hoango.gofitwear.domain.request.BrandRequest;
import hoango.gofitwear.domain.response.Meta;
import hoango.gofitwear.domain.response.ResultPagination;
import hoango.gofitwear.domain.response.brand.BrandResponse;
import hoango.gofitwear.repository.BrandRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BrandService {

    private final BrandRepository brandRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public BrandService(BrandRepository brandRepository, ModelMapper modelMapper) {
        this.brandRepository = brandRepository;
        this.modelMapper = modelMapper;
    }

    public ResultPagination getAllBrands(Specification<Brand> specification, Pageable pageable) {
        Page<Brand> brands = brandRepository.findAll(specification, pageable);

        ResultPagination resultPagination = new ResultPagination();
        Meta meta = new Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(brands.getTotalPages());
        meta.setTotal(brands.getTotalElements());

        resultPagination.setMeta(meta);

        List<BrandResponse> brandResponses = new ArrayList<>();
        for (Brand brand : brands.getContent()) {
            BrandResponse brandResponse = modelMapper.map(brand, BrandResponse.class);
            brandResponses.add(brandResponse);
        }
        resultPagination.setData(brandResponses);

        return resultPagination;
    }

    public BrandResponse getBrandById(Long id) {
        Optional<Brand> brandOptional = brandRepository.findById(id);
        return brandOptional.map(brand -> modelMapper.map(brand, BrandResponse.class)).orElse(null);
    }

    public BrandResponse createBrand(BrandRequest brandRequest) {
        if (brandRepository.existsByName(brandRequest.getName())) {
            return null; // Brand with this name already exists
        }

        Brand brand = new Brand();
        brand.setName(brandRequest.getName());
        brand.setDescription(brandRequest.getDescription());

        Brand savedBrand = brandRepository.save(brand);
        return modelMapper.map(savedBrand, BrandResponse.class);
    }

    public BrandResponse updateBrand(Long id, BrandRequest brandRequest) {
        Optional<Brand> brandOptional = brandRepository.findById(id);

        if (brandOptional.isEmpty()) {
            return null;
        }

        Brand brand = brandOptional.get();

        // Check if another brand with the same name exists (excluding current brand)
        if (!brand.getName().equals(brandRequest.getName()) &&
                brandRepository.existsByName(brandRequest.getName())) {
            return null; // Another brand with this name already exists
        }

        brand.setName(brandRequest.getName());
        brand.setDescription(brandRequest.getDescription());

        Brand updatedBrand = brandRepository.save(brand);
        return modelMapper.map(updatedBrand, BrandResponse.class);
    }

    public boolean deleteBrand(Long id) {
        if (brandRepository.existsById(id)) {
            Brand brand = brandRepository.findById(id).get();

            // Check if brand has associated products
            if (brand.getProducts() != null && !brand.getProducts().isEmpty()) {
                return false; // Can't delete brand with associated products
            }

            brandRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Get all brands without pagination (for dropdowns, etc.)
    public List<BrandResponse> getAllBrandsForDropdown() {
        List<Brand> brands = brandRepository.findAll();
        List<BrandResponse> brandResponses = new ArrayList<>();

        for (Brand brand : brands) {
            BrandResponse response = modelMapper.map(brand, BrandResponse.class);
            brandResponses.add(response);
        }

        return brandResponses;
    }
}
