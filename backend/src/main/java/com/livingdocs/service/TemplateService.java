package com.livingdocs.service;

import com.livingdocs.model.Template;
import com.livingdocs.payload.request.TemplateRequest;
import com.livingdocs.repository.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateService {

    @Autowired
    private TemplateRepository templateRepository;

    public Template createTemplate(TemplateRequest request) {
        Template template = new Template();
       template.setName(request.getTitle());
       template.setContentStructure(request.getContent());
       template.setIsDefault(false);
        return templateRepository.save(template);
    }

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Template getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
    }
}