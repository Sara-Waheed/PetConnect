import { SitterModel } from "../models/Sitter.js";
import { PetSitterService } from "../models/Services.js";
import { Appointment } from "../models/Appointment.js";


export const GetVerifiedSitters = async (req, res) => {
  try {
    const sitters = await SitterModel.find({
      emailVerified: true,
      verificationStatus: "verified",
      restricted: false,
    }).populate({
      path: "services",
      select: "serviceName price availability deliveryMethod",
    });

    const now = new Date();

const today = now.toISOString().split("T")[0]; // 'YYYY-MM-DD'

const sittersWithAvailability = sitters.map((sitter) => {
  const updatedServices = sitter.services.map((service) => {
    const isAvailableToday = service.availability?.some((slot) => {
      if (!slot.available) return false;

      const slotDate = new Date(`${slot.date}T${slot.time || '00:00'}`);
      
      // Check if it's today and the slot time is still in the future
      return (
        slotDate.toISOString().split("T")[0] === today &&
        slotDate > now
      );
    });

    return {
      ...service._doc,
      availableToday: isAvailableToday || false,
    };
  });

  return {
    ...sitter._doc,
    services: updatedServices,
  };
});


    console.log("Sitters with availability logic: ", sittersWithAvailability);

    return res.json({ sitters: sittersWithAvailability });
  } catch (err) {
    console.error("Error in GetVerifiedSitters:", err);
    return res.status(500).json({ message: "Error fetching Sitters" });
  }
};


export const GetSitterById = async (req, res) => {
  try {
    const { sitterId } = req.params;
    const { date, serviceType } = req.query;

    // 1. Normalize serviceType (URL → human)
    const serviceTypeMap = {
      'in-clinic':          'In-Clinic',
      'home-visit':         'Home Visit'
    };
    let normalizedServiceType;
    if (serviceType) {
      normalizedServiceType = serviceTypeMap[serviceType.toLowerCase()];
      if (!normalizedServiceType) {
        console.log("service type: ", serviceType);
        return res.status(400).json({ message: 'Invalid service type' });
      }
    }

    // 2. Fetch Sitter profile
    const sitter = await SitterModel.findById(sitterId)
      .select('-password -__v')
      .lean();
    if (!sitter) {
      return res.status(404).json({ message: 'Sitter not found' });
    }

    // 3. Load the Sitter services
    let services = await PetSitterService.find({
      _id: { $in: sitter.services }
    })
      .select('-__v')
      .lean();

      console.log("services fetched in serveR:", services);

    // 4. Filter by requested serviceType if provided
    if (normalizedServiceType) {
      services = services.filter(s =>
        s.deliveryMethod?.toLowerCase().trim() === normalizedServiceType.toLowerCase().trim()
      );
      if (services.length === 0) {
        return res.status(404).json({
          message: `Sitter doesn’t offer ${normalizedServiceType} services`
        });
      }
    }

    // 5. Build the date & weekday we’re querying (defaults to today)
    // Parse date as UTC and compute weekday in UTC
    const targetDate = date ? new Date(`${date}T00:00:00Z`) : new Date(); // Force UTC
    const isoDate = targetDate.toISOString().split('T')[0]; // Add this line
    const weekdayIndex = targetDate.getUTCDay();
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const weekday = weekdays[weekdayIndex];

    // Add debug logging to verify dates
    console.log('Received date:', date);
    console.log('Parsed UTC date:', targetDate.toISOString());
    console.log('Calculated weekday:', weekday);

    // 6. For each service, compute available slots
    const results = await Promise.all(services.map(async svc => {
      // a) collect all availability blocks for this weekday
      const matchingBlocks = Array.isArray(svc.availability)
        ? svc.availability.filter(block =>
            block.day.toLowerCase() === weekday.toLowerCase()
          )
        : [];

      // b) flatten their slots into one array
      const allSlots = matchingBlocks.reduce(
        (acc, block) => acc.concat(block.slots || []),
        []
      );

      // c) find any taken slots for this service on that date
      const taken = await Appointment.find({
        serviceId: svc._id,
        date:      isoDate,
        'slot.status': { $in: ['pending','booked'] }
      })
      .select('slot.startTime slot.endTime')
      .lean();

      // d) filter out taken slots
      const freeSlots = allSlots.filter(slot =>
        !taken.some(t =>
          t.slot?.startTime === slot.startTime &&
          t.slot?.endTime   === slot.endTime
        )
      );

      return {
        ...svc,
        availability: [{
          day:   weekday,
          slots: freeSlots
        }]
      };
    }));

    console.log("end services in serveR: ", results);

    // 7. Return Sitter profile + enriched services
    return res.json({
      ...sitter,
      services: results
    });

  } catch (err) {
    console.error('Error in GetSitterById:', err);
    return res.status(500).json({
      message: 'Error fetching Sitter details',
      error:   err.stack
    });
  }
};