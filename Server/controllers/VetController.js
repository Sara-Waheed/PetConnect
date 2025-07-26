
// controllers/vetController.js
import { VetModel } from "../models/Vet.js";
import { Appointment } from "../models/Appointment.js";
import { VeterinarianService } from "../models/Services.js";
import dayjs from 'dayjs'; // you can also use plain Date if you prefer


export const GetVetById = async (req, res) => {
  try {
    const { vetId } = req.params;
    const { date, serviceType } = req.query;

    // 1. Normalize serviceType (URL → human)
    const serviceTypeMap = {
      'video-consultation': 'Video Consultation',
      'in-clinic':          'In-Clinic',
      'home-visit':         'Home Visit'
    };
    let normalizedServiceType;
    if (serviceType) {
      normalizedServiceType = serviceTypeMap[serviceType.toLowerCase()];
      if (!normalizedServiceType) {
        return res.status(400).json({ message: 'Invalid service type' });
      }
    }

    // 2. Fetch Vet profile
    const vet = await VetModel.findById(vetId)
      .select('-password -__v')
      .lean();
    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    // 3. Load the Vet’s services
    let services = await VeterinarianService.find({
      _id: { $in: vet.services }
    })
      .select('-__v')
      .lean();

    // 4. Filter by requested serviceType if provided
    if (normalizedServiceType) {
      services = services.filter(s =>
        s.deliveryMethod?.toLowerCase().trim() === normalizedServiceType.toLowerCase().trim()
      );
      if (services.length === 0) {
        return res.status(404).json({
          message: `Vet doesn’t offer ${normalizedServiceType} services`
        });
      }
    }

    // 5. Build the date & weekday we’re querying (UTC)
    // 5. Build the date & weekday we’re querying (UTC)
const targetDate = date ? new Date(date + 'T00:00:00Z') : new Date();
const isoDate = targetDate.toISOString().split('T')[0];
const weekdayIndex = targetDate.getUTCDay();
const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const weekday = weekdays[weekdayIndex];

console.log('Server processing:', {
  receivedDate: date,
  parsedUTC: targetDate.toISOString(),
  isoDate,
  weekday,
  utcHours: targetDate.getUTCHours()
});

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

    // 7. Return vet profile + enriched services
    return res.json({
      ...vet,
      services: results
    });

  } catch (err) {
    console.error('Error in GetVetById:', err);
    return res.status(500).json({
      message: 'Error fetching vet details',
      error:   err.stack
    });
  }
};
// ─── GET ALL VERIFIED VETS ──────────────────────────────────────────────────────

export const GetVerifiedVets = async (req, res) => {
  try {
    // 1) fetch only fully verified vets
    const vets = await VetModel
      .find({
        emailVerified: true,
        verificationStatus: 'verified',
        restricted: false
      })
      .populate('clinicId', 'clinicName city')
      .populate({
        path: 'services',
        select: 'services customService description price duration isActive availability deliveryMethod'
      });

    // 2) figure out current weekday name
    const todayName = dayjs().format('dddd'); // e.g. "Tuesday"

    // 3) annotate each service with availableToday
    const vetsWithPhotosAndAvailability = vets.map(vet => {
      const obj = vet.toObject();

      // build profilePhotoUrl if present
      if (vet.profilePhoto?.data && vet.profilePhoto.contentType) {
        const b64 = vet.profilePhoto.data.toString('base64');
        obj.profilePhotoUrl = `data:${vet.profilePhoto.contentType};base64,${b64}`;
      } else {
        obj.profilePhotoUrl = null;
      }

      // for each populated service
      obj.services = obj.services.map(svc => {
        // find the availability entry for today
        const todayEntry = (svc.availability || []).find(a => a.day === todayName);
        
        // consider any slot whose status !== 'booked' as free
        const hasFree = todayEntry
          ? todayEntry.slots.some(slot => slot.status !== 'booked')
          : false;

        return {
          ...svc,
          availableToday: hasFree
        };
      });

      return obj;
    });

    return res.json({ vets: vetsWithPhotosAndAvailability });
  }
  catch (err) {
    console.error('Error in GetVerifiedVets:', err);
    return res.status(500).json({ message: 'Error fetching vets' });
  }
};


//
// ─── GET A SINGLE VET BY ID (WITH SLOT FILTERING) ───────────────────────────────
//
// export const GetVetById = async (req, res) => {
//   try {
//     const { vetId } = req.params;
//     const { date, serviceType } = req.query;

//     // 1️⃣ Normalize serviceType slug → human label
//     const serviceTypeMap = {
//       "video-consultation": "Video Consultation",
//       "in-clinic":          "In-Clinic",
//       "home-visit":         "Home Visit"
//     };
//     let normalizedServiceType = null;
//     if (serviceType) {
//       normalizedServiceType = serviceTypeMap[serviceType.toLowerCase()];
//       if (!normalizedServiceType) {
//         return res.status(400).json({ message: "Invalid service type" });
//       }
//     }

//     // 2️⃣ Load vet profile
//     const vet = await VetModel.findById(vetId)
//       .select("-password -__v")
//       .lean();
//     if (!vet) {
//       return res.status(404).json({ message: "Vet not found" });
//     }

//     // 3️⃣ Load the vet’s services
//     let services = await VeterinarianService.find({
//       _id: { $in: vet.services }
//     })
//     .select("-__v")
//     .lean();

//     // 4️⃣ If requested, filter by deliveryMethod
//     if (normalizedServiceType) {
//       services = services.filter(s =>
//         s.deliveryMethod?.toLowerCase().trim() === normalizedServiceType.toLowerCase().trim()
//       );
//       if (services.length === 0) {
//         return res.status(404).json({
//           message: `Vet doesn’t offer ${normalizedServiceType}`
//         });
//       }
//     }

//     // 5️⃣ Determine target date & weekday
//     const targetDate = date ? new Date(date) : new Date();
//     const isoDate    = targetDate.toISOString().split("T")[0];        // e.g. "2025-05-03"
//     const weekday    = targetDate.toLocaleDateString("en-US", { weekday: "long" });


//     // 6️⃣ For each service, remove slots already BOOKED
//     const enriched = await Promise.all(
//       services.map(async svc => {
//         // a) Get this weekday’s availability blocks
//         const blocks = Array.isArray(svc.availability)
//           ? svc.availability.filter(b =>
//               b.day.toLowerCase() === weekday.toLowerCase()
//             )
//           : [];

//         // b) Flatten into an array of slot objects
//         let allSlots = blocks.reduce(
//           (arr, b) => arr.concat(b.slots || []),
//           []
//         );

//         // c) (Optional) Remove past‐in‐day slots if date === today
//         if (isoDate === new Date().toISOString().split("T")[0]) {
//           const now = new Date();
//           allSlots = allSlots.filter(s => {
//             let [time, mer] = s.startTime.split(" ");
//             mer = mer.replace(/\./g, "").toUpperCase();
//             let [h, m] = time.split(":").map(Number);
//             if (mer === "PM" && h !== 12) h += 12;
//             if (mer === "AM" && h === 12) h = 0;
//             const slotDate = new Date(now);
//             slotDate.setHours(h, m, 0, 0);
//             return slotDate > now;
//           });
//         }

//         // d) Fetch only BOOKED appointments for this vet+date
//         const taken = await Appointment.find({
//           vetId,
//           date: new Date(isoDate),
//           "slot.status": "booked"
//         })
//         .select("slot.startTime slot.endTime")
//         .lean();

//         // e) Build a Set of booked "start__end" keys
//         const takenSet = new Set(
//           taken.map(a => `${a.slot.startTime}__${a.slot.endTime}`)
//         );

//         // f) Filter out any slot whose times match a booked one
//         const freeSlots = allSlots.filter(
//           s => !takenSet.has(`${s.startTime}__${s.endTime}`)
//         );

//         return {
//           ...svc,
//           availability: [{
//             day:   weekday,
//             slots: freeSlots
//           }]
//         };
//       })
//     );

//     // 7️⃣ Return vet + filtered services
//     return res.json({
//       ...vet,
//       services: enriched
//     });
//   } catch (err) {
//     console.error("Error in GetVetById:", err);
//     return res.status(500).json({
//       message: "Error fetching vet details",
//       error:   err.message
//     });
//   }
// };
