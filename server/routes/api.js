const express = require('express');
const router = express.Router();

const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const Hospital = require('../models/Hospital');
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');

// 🔌 Database Seeder
router.post('/seed', async (req, res) => {
  try {
    // Clear all existing data
    await Donor.deleteMany({});
    await Donation.deleteMany({});
    await Hospital.deleteMany({});
    await BloodRequest.deleteMany({});
    await Inventory.deleteMany({});

    // 1. Seed Inventory
    const initialInventory = [
      { bloodGroup: 'A+', unitsAvailable: 10 },
      { bloodGroup: 'A-', unitsAvailable: 5 },
      { bloodGroup: 'B+', unitsAvailable: 15 },
      { bloodGroup: 'B-', unitsAvailable: 8 },
      { bloodGroup: 'AB+', unitsAvailable: 12 },
      { bloodGroup: 'AB-', unitsAvailable: 4 },
      { bloodGroup: 'O+', unitsAvailable: 20 },
      { bloodGroup: 'O-', unitsAvailable: 10 }
    ];
    const seededInventory = await Inventory.insertMany(initialInventory);

    // 2. Seed Donors
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const donorsData = [
      {
        name: 'John Doe',
        age: 32,
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '123-456-7890',
        address: '123 Elm St',
        lastDonation: threeMonthsAgo
      },
      {
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        bloodGroup: 'O-',
        phone: '987-654-3210',
        address: '456 Oak St',
        lastDonation: oneMonthAgo
      },
      {
        name: 'Robert Johnson',
        age: 45,
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '555-555-5555',
        address: '789 Pine St',
        lastDonation: null
      }
    ];
    const seededDonors = await Donor.insertMany(donorsData);

    // 3. Seed Hospitals
    const hospitalsData = [
      {
        hospitalName: 'City General Hospital',
        contactPerson: 'Dr. Sarah Connor',
        phone: '111-222-3333',
        address: '100 Medical Plaza'
      },
      {
        hospitalName: 'St. Jude Research Hospital',
        contactPerson: 'Dr. Marcus Aurelius',
        phone: '444-555-6666',
        address: '200 Hope Way'
      },
      {
        hospitalName: 'Grace Valley Clinic',
        contactPerson: 'Nurse Jackie',
        phone: '777-888-9999',
        address: '300 Peace Dr'
      }
    ];
    const seededHospitals = await Hospital.insertMany(hospitalsData);

    // 4. Seed Past Donations
    const donationsData = [
      {
        donorId: seededDonors[0]._id,
        bloodGroup: 'A+',
        unitsDonated: 1,
        donationDate: threeMonthsAgo
      },
      {
        donorId: seededDonors[1]._id,
        bloodGroup: 'O-',
        unitsDonated: 2,
        donationDate: oneMonthAgo
      }
    ];
    await Donation.insertMany(donationsData);

    // 5. Seed Blood Requests
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const requestsData = [
      {
        hospitalId: seededHospitals[0]._id,
        bloodGroup: 'B+',
        unitsRequired: 3,
        requestDate: twoDaysAgo,
        status: 'Pending'
      },
      {
        hospitalId: seededHospitals[1]._id,
        bloodGroup: 'A+',
        unitsRequired: 2,
        requestDate: fiveDaysAgo,
        status: 'Approved' // Assumed to be already processed
      }
    ];
    await BloodRequest.insertMany(requestsData);

    res.json({ message: 'Database seeded successfully with clean relational dummy data!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Stats/Overview Aggregations
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });

    // Find any blood groups below safety threshold (e.g. < 6 units)
    const lowStockAlerts = await Inventory.find({ unitsAvailable: { $lt: 6 } });

    res.json({
      totalDonors,
      totalDonations,
      totalHospitals,
      pendingRequests,
      lowStockAlertsCount: lowStockAlerts.length,
      lowStockAlerts: lowStockAlerts.map(i => i.bloodGroup)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🩸 Inventory Endpoints
router.get('/inventory', async (req, res) => {
  try {
    const stock = await Inventory.find().sort({ bloodGroup: 1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/inventory/manual', async (req, res) => {
  const { bloodGroup, unitsAvailable } = req.body;
  try {
    const item = await Inventory.findOneAndUpdate(
      { bloodGroup },
      { unitsAvailable: parseInt(unitsAvailable) },
      { new: true, upsert: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧑 Donors Endpoints
router.get('/donors', async (req, res) => {
  try {
    const donors = await Donor.find().sort({ name: 1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donors', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/donors/:id', async (req, res) => {
  try {
    const updated = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/donors/:id', async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏥 Hospital Endpoints
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ hospitalName: 1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hospitals', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hospitals/:id', async (req, res) => {
  try {
    const updated = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hospitals/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💉 Donation Endpoints (Transactions)
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId')
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donations', async (req, res) => {
  const { donorId, unitsDonated, donationDate } = req.body;
  try {
    // 1. Verify donor exists
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found.' });
    }

    // 2. Create the donation record
    const donation = new Donation({
      donorId,
      bloodGroup: donor.bloodGroup,
      unitsDonated: parseInt(unitsDonated),
      donationDate: donationDate || new Date()
    });
    await donation.save();

    // 3. Increment inventory for this blood group
    await Inventory.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { unitsAvailable: parseInt(unitsDonated) } },
      { new: true, upsert: true }
    );

    // 4. Update the donor's last donation date
    donor.lastDonation = donationDate || new Date();
    await donor.save();

    res.json({ message: 'Donation recorded and inventory incremented successfully!', donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Request Endpoints (Transactions)
router.get('/requests', async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospitalId')
      .sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/requests', async (req, res) => {
  const { hospitalId, bloodGroup, unitsRequired, requestDate } = req.body;
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found.' });
    }

    const newRequest = new BloodRequest({
      hospitalId,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      requestDate: requestDate || new Date(),
      status: 'Pending'
    });
    await newRequest.save();

    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/requests/:id', async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected' or 'Pending'
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found.' });
    }

    // Business Logic: If approving a request that was NOT already approved
    if (status === 'Approved' && request.status !== 'Approved') {
      // Check inventory
      const inv = await Inventory.findOne({ bloodGroup: request.bloodGroup });
      if (!inv || inv.unitsAvailable < request.unitsRequired) {
        return res.status(400).json({ 
          error: `Insufficient inventory for ${request.bloodGroup}. Available: ${inv ? inv.unitsAvailable : 0} units, Required: ${request.unitsRequired} units.` 
        });
      }

      // Decrement inventory
      inv.unitsAvailable -= request.unitsRequired;
      await inv.save();
    } 
    // Business Logic: If reverting an already Approved request back to Pending/Rejected
    else if (status !== 'Approved' && request.status === 'Approved') {
      // Refund the units to inventory
      await Inventory.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: request.unitsRequired } }
      );
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request status updated to ${status}.`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (request && request.status === 'Approved') {
      // Refund inventory units on delete of approved request
      await Inventory.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: request.unitsRequired } }
      );
    }
    await BloodRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted and inventory adjusted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
