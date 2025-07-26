import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { PetGroomerService, PetSitterService, VeterinarianService } from "../models/Services.js";
import { SitterModel } from "../models/Sitter.js";
import jwt from 'jsonwebtoken';

export const AddService = async (req, res) => {
  const { userRole } = req.query; // vet | groomer | sitter
  const serviceModelMappings = {
    vet: VeterinarianService,
    groomer: PetGroomerService,
    sitter: PetSitterService,
  };
  const ServiceModel = serviceModelMappings[userRole];
  if (!ServiceModel) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  // Auth
  const token = req.cookies[`${userRole}Token`];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const providerId = decoded.id;

    // Extract everything from body
    const {
      services,        // array of strings
      customService,   // string
      description,     // string
      price,           // number or string
      duration,        // number or string
      isPackage,       // boolean (groomer only)
      maxPets,         // number  (sitter only)
      availability,    // array
      deliveryMethod,  // string: "Home Visit" | "On-Site" | etc.
      address,         // string
      city,            // string
      coverageType,    // "radius" | "areas"
      serviceRadius,   // number (km)
      commuteBuffer,   // number (minutes)
      areas            // array of strings
    } = req.body;

    // Basic validations
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'At least one service is required' });
    }
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (!deliveryMethod) {
      return res.status(400).json({ message: 'Delivery method is required' });
    }

    // Home Visit specific validation
    if (deliveryMethod === 'Home Visit') {
      if (!address) {
        return res.status(400).json({ message: 'Address is required for Home Visit' });
      }
      if (!city) {
        return res.status(400).json({ message: 'City is required for Home Visit' });
      }
      if (coverageType === 'radius') {
        if (!serviceRadius || serviceRadius <= 0) {
          return res.status(400).json({ message: 'Valid serviceRadius is required' });
        }
        if (!commuteBuffer || commuteBuffer < 0) {
          return res.status(400).json({ message: 'Valid commuteBuffer is required' });
        }
      } else if (coverageType === 'areas') {
        if (!areas || !Array.isArray(areas) || areas.length === 0) {
          return res.status(400).json({ message: 'Select at least one area' });
        }
      } else {
        return res.status(400).json({ message: 'Invalid coverageType' });
      }
    }

    // Find provider record
    let provider;
    if (userRole === 'vet') {
      provider = await VetModel.findById(providerId);
    } else if (userRole === 'groomer') {
      provider = await GroomerModel.findById(providerId);
    } else if (userRole === 'sitter') {
      provider = await SitterModel.findById(providerId);
    }
    if (!provider) {
      return res.status(404).json({ message: `${userRole} not found` });
    }

    // Build service payload
    const serviceData = {
      providerId,
      services,
      customService,
      description,
      price,
      duration,
      isActive: true,
      availability,
      deliveryMethod,
    };

    // Role-specific flags
    if (userRole === 'groomer') {
      serviceData.isPackage = isPackage || false;
    } else if (userRole === 'sitter') {
      serviceData.maxPets = maxPets || 1;
    }

    // Home Visit fields
    if (deliveryMethod === 'Home Visit') {
      serviceData.address = address;
      serviceData.city = city;
      serviceData.coverageType = coverageType;
      if (coverageType === 'radius') {
        serviceData.serviceRadius = serviceRadius;
        serviceData.commuteBuffer = commuteBuffer;
      } else {
        serviceData.areas = areas;
      }
    }

    // Save the new service
    const newService = new ServiceModel(serviceData);
    const savedService = await newService.save();

    // Link service to provider
    provider.services = provider.services || [];
    provider.services.push(savedService._id);
    await provider.save();

    return res
      .status(201)
      .json({ message: 'Service created successfully', service: savedService });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating service' });
  }
};
  
export const GetServicesByProvider = async (req, res) => {
    try {
      const { userRole } = req.query;
  
      const serviceModelMappings = {
        vet: VeterinarianService,          
        groomer: PetGroomerService,  
        sitter: PetSitterService,    
      };
  
      const ServiceModel = serviceModelMappings[userRole];
      if (!ServiceModel) {
        return res.status(400).json({ success: false, message: "Invalid role provided" });
      }
  
      const token = req.cookies[`${userRole}Token`]; 
  
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }
  
      // Decode the token to get providerId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const providerId = decoded.id;
  
      // Fetch services for the specific provider (vet, groomer, or sitter)
      const services = await ServiceModel.find({ providerId })
        .populate('providerId', 'name') // Optionally populate provider info (e.g., name)
        .exec();
  
      if (!services || services.length === 0) {
        return res.status(204).json({ message: `No services found for this ${userRole}` });
      }
  
      // Return the services related to the provider
      return res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ message: 'Error fetching services' });
    }
};
  
export const GetServiceDetails = async (req, res) => {
    const { userRole } = req.query; // The userRole comes from the query parameters (e.g., ?userRole=groomer)
    const { serviceId } = req.params; // The serviceId comes from the URL parameters
    
    // Define the model mappings for each user role's service model
    const serviceModelMappings = {
      vet: VeterinarianService,
      groomer: PetGroomerService,
      sitter: PetSitterService,
    };
  
    // Select the appropriate service model based on userRole
    const ServiceModel = serviceModelMappings[userRole];
    if (!ServiceModel) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }
  
    try {
      // Fetch the service details by serviceId from the selected service model
      const service = await ServiceModel.findOne({ _id: serviceId });
  
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
  
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      console.error("Error fetching service details:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const DeleteService = async (req, res) => {
  const { userRole } = req.query;
  const { serviceId } = req.params;

  const serviceModelMappings = {
    vet: VeterinarianService,
    groomer: PetGroomerService,
    sitter: PetSitterService,
  };

  const userModelMappings = {
    vet: VetModel,
    groomer: GroomerModel,
    sitter: SitterModel,
  };

  const ServiceModel = serviceModelMappings[userRole];
  const UserModel = userModelMappings[userRole];

  if (!ServiceModel || !UserModel) {
    return res.status(400).json({ success: false, message: "Invalid role provided" });
  }

  try {
    const deletedService = await ServiceModel.findByIdAndDelete(serviceId);

    if (!deletedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Remove the serviceId from the provider (user)'s services array
    await UserModel.updateOne(
      { services: serviceId },
      { $pull: { services: serviceId } }
    );

    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const UpdateService = async (req, res) => {
  const { userRole } = req.query;
  const { serviceId } = req.params;
  
  const { 
    services,            
    customService, 
    description, 
    price, 
    duration, 
    isPackage, 
    maxPets, 
    availability, 
    deliveryMethod        
  } = req.body;

  const serviceModelMappings = {
    vet: VeterinarianService,
    groomer: PetGroomerService,
    sitter: PetSitterService,
  };

  const userModelMappings = {
    vet: VetModel,
    groomer: GroomerModel,
    sitter: SitterModel,
  };

  const ServiceModel = serviceModelMappings[userRole];
  const UserModel = userModelMappings[userRole];

  if (!ServiceModel || !UserModel) {
    return res.status(400).json({ success: false, message: "Invalid role provided" });
  }

  if (!serviceId || !services || !Array.isArray(services) || services.length === 0 || !price) {
    return res.status(400).json({ success: false, message: "Service ID, at least one service, and price are required" });
  }

  try {
    const service = await ServiceModel.findById(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Update fields
    service.services = services;
    service.customService = customService;
    service.description = description;
    service.price = price;
    service.duration = duration;
    service.availability = availability;
    service.deliveryMethod = deliveryMethod;

    // Role-specific fields
    if (userRole === 'groomer') {
      service.isPackage = isPackage || false;
    } else if (userRole === 'sitter') {
      service.maxPets = maxPets || 1;
    }

    const updatedService = await service.save();

    return res.status(200).json({ success: true, message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};