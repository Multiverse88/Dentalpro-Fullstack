const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  // Reset data
  // Hapus data dari tabel dengan urutan yang benar untuk menghindari constraint violation
  await prisma.treatment.deleteMany({});
  await prisma.tooth.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Data gigi akan dibuat untuk setiap pasien nanti
  console.log('Teeth will be created for each patient');

  // Fake data
  const names = [
    'Budi Santoso', 'Siti Aminah', 'Andi Wijaya', 'Dewi Lestari', 'Rina Kurniawan', 'Agus Prabowo', 'Fitriani', 'Joko Susilo', 'Maya Sari', 'Tono Prasetyo',
    'Lina Marlina', 'Dian Puspita', 'Rizky Ramadhan', 'Yuni Astuti', 'Fajar Nugroho', 'Sari Dewi', 'Dedi Gunawan', 'Putri Ayu', 'Hendra Saputra', 'Nina Kartika',
    'Eka Putra', 'Rizka Amelia', 'Bayu Saputra', 'Wulan Sari', 'Dimas Prasetya', 'Ayu Lestari', 'Rudi Hartono', 'Mega Sari', 'Fikri Hidayat', 'Sinta Dewi',
    'Rian Pratama', 'Dewi Sartika', 'Bambang Irawan', 'Suci Ramadhani', 'Yoga Pratama', 'Novi Andriani', 'Dian Permata', 'Rina Susanti', 'Fajar Setiawan', 'Lina Agustina',
    'Dedi Prasetyo', 'Putri Maharani', 'Hendra Wijaya', 'Nina Sari', 'Eka Saputra', 'Rizka Putri', 'Bayu Prabowo', 'Wulan Dewi', 'Dimas Saputra', 'Ayu Pratiwi',
    'Rudi Santoso', 'Mega Putri', 'Fikri Ramadhan', 'Sinta Lestari', 'Rian Nugroho', 'Dewi Kurniawan', 'Bambang Prasetyo', 'Suci Amelia', 'Yoga Hidayat', 'Novi Sari',
    'Dian Agustina', 'Rina Permata', 'Fajar Susilo', 'Lina Ramadhani', 'Dedi Setiawan', 'Putri Andriani', 'Hendra Pratama', 'Nina Permata', 'Eka Sari', 'Rizka Dewi',
    'Bayu Pratama', 'Wulan Maharani', 'Dimas Wijaya', 'Ayu Nugroho', 'Rudi Prabowo', 'Mega Dewi', 'Fikri Prasetyo', 'Sinta Putri', 'Rian Lestari', 'Dewi Santoso',
    'Bambang Nugroho', 'Suci Pratiwi', 'Yoga Santoso', 'Novi Prasetyo', 'Dian Nugroho', 'Rina Pratiwi', 'Fajar Prabowo', 'Lina Dewi', 'Dedi Maharani', 'Putri Nugroho',
    'Hendra Ramadhan', 'Nina Pratama', 'Eka Dewi', 'Rizka Pratiwi', 'Bayu Santoso', 'Wulan Pratiwi', 'Dimas Dewi', 'Ayu Prasetyo', 'Rudi Dewi', 'Mega Pratiwi'
  ];
  const addresses = [
    'Jl. Merdeka No. 1, Jakarta', 'Jl. Sudirman No. 2, Bandung', 'Jl. Diponegoro No. 3, Surabaya', 'Jl. Gajah Mada No. 4, Yogyakarta',
    'Jl. Ahmad Yani No. 5, Semarang', 'Jl. Pemuda No. 6, Medan', 'Jl. Asia Afrika No. 7, Bandung', 'Jl. Malioboro No. 8, Yogyakarta',
    'Jl. Gatot Subroto No. 9, Jakarta', 'Jl. Sisingamangaraja No. 10, Medan'
  ];
  const genders = ['Male', 'Female'];
  const procedures = ['Tambal Gigi', 'Cabut Gigi', 'Scaling', 'Pemasangan Behel', 'Pembersihan Karang Gigi'];
  const notes = ['Sukses', 'Perlu kontrol ulang', 'Pasien mengeluh nyeri', 'Tidak ada komplikasi', 'Butuh perawatan lanjutan'];

  // 100 patients
  const fakePatients = [];
  for (let i = 0; i < 100; i++) {
    const name = randomItem(names);
    const patient = await prisma.patient.create({
      data: {
        id: uuidv4(),
        name,
        dateOfBirth: randomDate(new Date('1970-01-01'), new Date('2015-12-31')),
        gender: randomItem(genders),
        contact: '08' + Math.floor(1000000000 + Math.random() * 9000000000),
        address: randomItem(addresses),
      }
    });
    fakePatients.push(patient);
    
    // Create teeth for each patient
    const toothStatuses = ['Healthy', 'Decay', 'Filled', 'Extracted', 'RootCanal', 'Crown', 'Missing'];
    for (let toothNumber = 1; toothNumber <= 32; toothNumber++) {
      await prisma.tooth.create({
        data: {
          number: toothNumber,
          status: randomItem(toothStatuses),
          patientId: patient.id
        }
      });
    }
  }
  console.log('Seeded 100 patients with their teeth!');

  // Treatments
  const treatmentStartDate = new Date('2020-01-01');
  const treatmentEndDate = new Date('2025-12-31');
  
  // Daftar deskripsi perawatan
  const treatmentTypes = [
    'Tambal Gigi',
    'Pencabutan Gigi',
    'Pembersihan Karang Gigi',
    'Perawatan Saluran Akar',
    'Pemasangan Crown',
    'Pemasangan Behel',
    'Pencabutan Gigi Bungsu',
    'Pemasangan Gigi Palsu'
  ];
  
  for (const patient of fakePatients) {
    // Dapatkan gigi pasien
    const patientTeeth = await prisma.tooth.findMany({
      where: { patientId: patient.id },
      orderBy: { number: 'asc' }
    });
    
    if (patientTeeth.length === 0) continue;
    
    // Buat 2-4 perawatan untuk setiap pasien
    const numTreatments = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numTreatments; i++) {
      // Pilih 1-3 gigi untuk perawatan ini
      const numTeeth = Math.min(Math.floor(Math.random() * 3) + 1, patientTeeth.length);
      const treatedTeethIndices = [];
      
      // Pilih indeks gigi yang akan dirawat
      while (treatedTeethIndices.length < numTeeth) {
        const randomIndex = Math.floor(Math.random() * patientTeeth.length);
        if (!treatedTeethIndices.includes(randomIndex)) {
          treatedTeethIndices.push(randomIndex);
        }
      }
      
      // Dapatkan nomor gigi yang akan dirawat
      const treatedTeethNumbers = treatedTeethIndices.map(index => patientTeeth[index].number);
      
      // Tentukan jenis perawatan
      const treatmentType = randomItem(treatmentTypes);
      const treatmentDescription = `${treatmentType} untuk gigi ${treatedTeethNumbers.join(', ')}`;
      
      // Buat perawatan
      await prisma.treatment.create({
        data: {
          id: uuidv4(),
          patientId: patient.id,
          date: randomDate(treatmentStartDate, treatmentEndDate),
          description: treatmentDescription,
          type: treatmentType,
          teeth: treatedTeethNumbers, // Simpan sebagai array JSON
          notes: randomItem(notes),
          cost: Math.floor(Math.random() * 500000) + 100000,
          performedBy: 'Dr. ' + randomItem(['Budi', 'Siti', 'Andi', 'Dewi', 'Rina'])
        }
      });
    }
  }
  
  console.log('Seeded treatments for 100 patients!');

  // Tambah user demo
  const demoPassword = 'admin123';
  const demoHash = await bcrypt.hash(demoPassword, 10);
  
  try {
    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    });

    if (!existingUser) {
      // Buat user baru jika belum ada
      await prisma.user.create({
        data: {
          id: uuidv4(),
          name: 'Admin Demo',
          email: 'admin@demo.com',
          password: demoHash,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      console.log('Seeded demo user: admin@demo.com / admin123');
    } else {
      // Update user yang sudah ada
      await prisma.user.update({
        where: { email: 'admin@demo.com' },
        data: {
          password: demoHash,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      console.log('Updated demo user: admin@demo.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
