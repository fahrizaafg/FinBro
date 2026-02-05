export const translations = {
  id: {
    sidebar: {
      dashboard: 'Dashboard',
      transactions: 'Transaksi',
      budget: 'Anggaran',
      debts: 'Hutang',
      categories: 'Kategori',
      settings: 'Pengaturan',
    logout: 'Keluar',
    pro: 'PRO',
    freePlan: 'Paket Gratis',
    welcomeBack: 'Selamat datang kembali,',
    hello: 'Halo,'
  },
  dashboard: {
      totalBalance: 'Total Saldo',
      vsLastMonth: 'vs bulan lalu',
      addTransaction: 'Tambah Transaksi',
      monthlyBudget: 'Anggaran Bulanan',
      totalSpent: 'Total Pengeluaran',
      remaining: 'Sisa',
      weeklySpending: 'Pengeluaran Mingguan',
      monthlySpending: 'Pengeluaran Bulanan',
      last7Days: '7 Hari Terakhir',
      last30Days: 'Bulanan',
      recentTransactions: 'Transaksi Terakhir',
      viewAll: 'Lihat Semua',
      emptyState: {
        title: 'Belum ada transaksi nih',
        subtitle: 'Yuk tambahin transaksi pertamamu!'
      },
      modal: {
        title: 'Tambah Transaksi',
        editTitle: 'Edit Transaksi',
        name: 'Nama Transaksi',
        namePlaceholder: 'cth. Makan Siang, Gaji',
        type: 'Tipe',
        expense: 'Pengeluaran',
        income: 'Pemasukan',
        amount: 'Nominal',
        amountPlaceholder: 'cth. 50.000',
        category: 'Kategori',
        categoryPlaceholder: 'cth. Makanan, Transportasi',
        desc: 'Deskripsi (Opsional)',
        descPlaceholder: 'Detail tambahan...',
        date: 'Tanggal',
        save: 'Simpan Transaksi',
        other: 'Lainnya...',
        editBudget: 'Edit Total Anggaran',
        globalBudgetTitle: 'Total Anggaran Bulanan',
        autoCalculate: 'Biarkan kosong untuk hitung otomatis dari kategori',
        saveBudget: 'Simpan Anggaran',
        saving: 'Menyimpan...',
        newCategoryHint: '"{category}" akan ditambahkan sebagai kategori baru'
      },
      warning: {
        title: 'Peringatan Anggaran!',
        message: 'Anda telah melebihi anggaran bulanan sebesar',
        badge: 'Overbudget'
      }
    },
    transactions: {
      title: 'Riwayat Transaksi',
      subtitle: 'Pantau semua pemasukan dan pengeluaranmu di sini.',
      searchPlaceholder: 'Cari transaksi...',
      allCategories: 'Semua Kategori',
      income: 'Pemasukan',
      expense: 'Pengeluaran',
      manualEntry: 'Input Manual',
      table: {
        date: 'Tanggal',
        desc: 'Keterangan',
        category: 'Kategori',
        amount: 'Jumlah',
        actions: 'Aksi'
      },
      pagination: {
        showing: 'Menampilkan',
        of: 'dari',
        entries: 'entri'
      },
      saveChanges: 'Simpan Perubahan'
    },
    budget: {
      title: 'Anggaran Bulanan',
      subtitle: 'Kelola batas pengeluaranmu per kategori.',
      addBudget: 'Tambah Anggaran',
      totalBudget: 'Total Anggaran',
      remaining: 'Sisa',
      spending: 'Terpakai',
      emptyState: {
        title: 'Belum ada anggaran',
        subtitle: 'Buat anggaran agar pengeluaranmu terkontrol!'
      },
      modal: {
        categoryPrompt: 'Masukkan nama kategori anggaran (contoh: Makanan, Transportasi):',
        existsAlert: 'Anggaran untuk kategori ini sudah ada!',
        limitPrompt: 'Masukkan batas anggaran (Rp):',
        invalidAlert: 'Jumlah tidak valid!'
      },
      status: {
        overbudget: 'Waduh, overbudget nih!',
        safe: 'Aman, masih ada sisa.',
        onTrack: 'Aman',
        overbudgetExcl: 'Overbudget!'
      },
      alert: {
        overbudgetTitle: 'Peringatan: Over Budget!',
        overbudgetDesc: 'Total pengeluaran Anda telah melebihi batas anggaran bulanan sebesar '
      },
      deleteConfirm: 'Hapus anggaran untuk {category}?',
      monthlyTarget: 'Target bulan ini',
      resetTooltip: 'Reset ke total kategori',
      resetButton: 'Reset',
      categoryDetails: 'Rincian Kategori',
      editBudget: 'Edit Anggaran'
    },
    debts: {
      title: 'Manajemen Hutang',
      subtitle: 'Catat siapa yang berhutang padamu atau sebaliknya.',
      addDebt: 'Tambah Hutang',
      totalDebt: 'Total Hutang Saya',
      totalReceivables: 'Total Piutang (Orang Lain)',
      tabs: {
        debt: 'Hutang Saya',
        receivable: 'Piutang'
      },
      table: {
        name: 'Nama',
        amount: 'Jumlah',
        remaining: 'Sisa',
        dueDate: 'Jatuh Tempo',
        status: 'Status',
        actions: 'Aksi',
        paid: 'Lunas',
        unpaid: 'Belum Lunas'
      },
      searchPlaceholder: 'Cari nama atau deskripsi...',
      payAction: 'Bayar',
      paymentProgress: 'Progress Pembayaran',
      paymentHistory: 'Riwayat Pembayaran',
      noPaymentHistory: 'Belum ada riwayat pembayaran.',
      emptyState: {
        debt: {
          title: 'Tidak ada hutang',
          subtitle: 'Wah, kamu bebas finansial!'
        },
        receivable: {
          title: 'Tidak ada piutang',
          subtitle: 'Belum ada yang berhutang padamu.'
        }
      },
      modal: {
        title: 'Tambah Catatan Baru',
        editTitle: 'Ubah Hutang/Piutang',
        typeLabel: 'Jenis Catatan',
        debtType: 'Hutang (Saya Pinjam)',
        receivableType: 'Piutang (Saya Pinjamkan)',
        personLabel: 'Nama Orang/Pihak',
        personPlaceholder: 'Contoh: Budi, Bank ABC',
        amountLabel: 'Jumlah',
        dateLabel: 'Tanggal Transaksi',
        dueDateLabel: 'Tanggal Jatuh Tempo (Opsional)',
        descLabel: 'Keterangan',
        save: 'Simpan',
        payTitle: 'Bayar Hutang',
        payAmount: 'Jumlah Pembayaran',
        payNote: 'Catatan Pembayaran',
        payButton: 'Bayar Sekarang',
        totalDebtLabel: 'Total Hutang',
        totalReceivableLabel: 'Total Piutang',
        alreadyPaid: 'Sudah dibayar:',
        remaining: 'Sisa:'
      }
    },
    categories: {
      title: 'Kategori',
      subtitle: 'Lihat ringkasan pengeluaran per kategori.',
      infoButton: 'Info Kategori',
      addCategory: 'Tambah Kategori',
      infoAlert: 'Kategori akan otomatis dibuat saat kamu menambahkan transaksi baru dengan nama kategori tersebut!',
      tipsLabel: 'Tips:',
      gotIt: 'Mengerti',
      saveCategory: 'Simpan Kategori',
      tips: [
        'Kategori dibuat otomatis saat kamu menambah transaksi dengan nama kategori baru.',
        'Gunakan nama yang konsisten (misal: "Makan" vs "makan") agar tetap satu grup.',
        'Kamu bisa mengatur budget untuk setiap kategori di tab Anggaran.'
      ],
      searchPlaceholder: 'Cari kategori...',
      tabs: {
        all: 'Semua',
        expense: 'Pengeluaran',
        income: 'Pemasukan'
      },
      card: {
        transactions: 'transaksi',
        activity: 'Aktivitas'
      },
      emptyState: {
        title: 'Belum ada data kategori',
        subtitle: 'Data akan muncul setelah kamu menambah transaksi.'
      },
      items: {
        food: 'Makanan',
        transport: 'Transportasi',
        housing: 'Tempat Tinggal',
        entertainment: 'Hiburan',
        health: 'Kesehatan',
        shopping: 'Belanja',
        education: 'Pendidikan',
        utilities: 'Tagihan',
        other: 'Lainnya',
        salary: 'Gaji',
        bonus: 'Bonus',
        investment: 'Investasi',
        gift: 'Hadiah',
        business: 'Hasil Usaha',
        otherIncome: 'Pendapatan Lainnya'
      },
      default: [
        'Makanan',
        'Transportasi',
        'Belanja',
        'Hiburan',
        'Tagihan',
        'Kesehatan',
        'Pendidikan',
        'Sewa/KPR',
        'Asuransi',
        'Tabungan',
        'Darurat',
        'Amal',
        'Langganan',
        'Perawatan Diri',
        'Hewan Peliharaan',
        'Lainnya'
      ]
    },
    settings: {
      title: 'Pengaturan',
      subtitle: 'Sesuaikan aplikasi dengan kebutuhanmu.',
      appPreferences: 'Preferensi Aplikasi',
      appPreferencesDesc: 'Pilih bahasa dan mata uang pilihanmu.',
      currency: 'Mata Uang',
      wip: '(Dalam Pengembangan)',
      wipDesc: 'Fitur ini sedang dalam pengembangan dan belum tersedia.',
      currencyIDR: 'Rupiah Indonesia',
      currencyUSD: 'Dolar Amerika Serikat',
      language: 'Bahasa',
      dataManagement: 'Manajemen Data',
      dataManagementDesc: 'Cadangkan atau pulihkan data aplikasimu.',
      exportJson: 'Ekspor Data (JSON)',
      importJson: 'Impor Data (JSON)',
      about: 'Tentang Aplikasi',
      createdBy: 'Dibuat oleh',
      save: 'Simpan Perubahan',
      savedAlert: 'Pengaturan berhasil disimpan!',
      importAlert: 'Data berhasil diimpor!',
      importError: 'Gagal mengimpor data. Pastikan format JSON benar.',
      didYouKnow: 'Tahukah kamu?',
      didYouKnowDesc: 'Data kamu tersimpan secara lokal di browser ini. Jangan lupa untuk melakukan ekspor data secara berkala agar tidak hilang!',
      profileSettings: 'Pengaturan Profil',
      profileDesc: 'Kelola profil publik dan tampilanmu.',
      displayName: 'Nama Tampilan',
      nameSessionInfo: 'Nama saat ini dikelola oleh sesi login.',
      tagline: '"Solusi manajemen keuangan modern"',
      support: 'Dukung di Saweria'
    },
    login: {
      welcome: 'Selamat Datang di FinBro',
      subtitle: 'Kelola keuanganmu dengan santai dan mudah.',
      nameLabel: 'Nama Kamu',
      namePlaceholder: 'Masukkan namamu...',
      button: 'Masuk'
    },
    common: {
      days: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      success: 'Berhasil',
      error: 'Gagal',
      fullscreen: 'Layar Penuh',
      exitApp: 'Keluar Aplikasi',
      notifications: 'Notifikasi',
      markAllRead: 'Tandai semua dibaca',
      noNotifications: 'Tidak ada notifikasi baru',
      history: 'Riwayat Aksi',
      undo: 'Urungkan',
      redo: 'Ulangi',
      cancel: 'Batal',
      save: 'Simpan',
      noActions: 'Belum ada aksi',
      deleteAll: 'Hapus Semua',
      otherNotifications: 'notifikasi lainnya',
      guest: 'Tamu',
      user: 'Pengguna',
      profile: 'Profil',
      minimize: 'Minimize',
      maximize: 'Maximize',
      close: 'Tutup',
      search: 'Cari',
      filter: 'Filter',
      appName: 'FinBro Desktop'
    },
    profile: {
      title: 'Foto Profil',
      change: 'Ubah Foto',
      uploadNew: 'Unggah foto baru',
      dragDrop: 'Seret & lepas gambar di sini, atau klik untuk memilih',
      supports: 'Mendukung: JPG, PNG, WEBP (Maks 5MB)',
      minRes: 'Min 200x200px',
      savePhoto: 'Simpan Foto',
      zoom: 'Perbesar',
      rotation: 'Rotasi',
      edit: 'Edit Foto',
      updateSuccess: 'Berhasil diperbarui',
      uploading: 'Mengunggah...',
      errorSize: 'Ukuran file terlalu besar (Maks 5MB)',
      errorRes: 'Resolusi gambar minimal 200x200px',
      errorProcess: 'Gagal memproses gambar'
    }
  },
  en: {
    sidebar: {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      budget: 'Budget',
      debts: 'Debts',
      categories: 'Categories',
      settings: 'Settings',
    logout: 'Logout',
    pro: 'PRO',
    freePlan: 'Free Plan',
    welcomeBack: 'Welcome back,',
    hello: 'Hello,'
  },
  dashboard: {
      totalBalance: 'Total Balance',
      vsLastMonth: 'vs last month',
      addTransaction: 'Add Transaction',
      monthlyBudget: 'Monthly Budget',
      totalSpent: 'Total Spent',
      remaining: 'Remaining',
      weeklySpending: 'Weekly Spending',
      monthlySpending: 'Last 30 Days Spending',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      recentTransactions: 'Recent Transactions',
      viewAll: 'View All',
      emptyState: {
        title: 'No transactions yet',
        subtitle: 'Let\'s add your first transaction!'
      },
      modal: {
        title: 'Add Transaction',
        editTitle: 'Edit Transaction',
        name: 'Transaction Name',
        namePlaceholder: 'e.g. Lunch, Salary',
        type: 'Type',
        expense: 'Expense',
        income: 'Income',
        amount: 'Amount',
        amountPlaceholder: 'e.g. 50000',
        category: 'Category',
        categoryPlaceholder: 'e.g. Food, Transport',
        desc: 'Description (Optional)',
        descPlaceholder: 'Additional details...',
        date: 'Date',
        save: 'Save Transaction',
        other: 'Other...',
        editBudget: 'Edit Total Budget',
        globalBudgetTitle: 'Total Monthly Budget',
        autoCalculate: 'Leave empty to calculate automatically from categories',
        saveBudget: 'Save Budget',
        saving: 'Saving...',
        newCategoryHint: '"{category}" will be added as a new category'
      },
      warning: {
        title: 'Budget Warning!',
        message: 'You have exceeded your monthly budget by',
        badge: 'Overbudget'
      }
    },
    transactions: {
      title: 'Recent Transactions',
      subtitle: 'Track your income and spending activity.',
      searchPlaceholder: 'Search Transactions...',
      allCategories: 'All Categories',
      income: 'Income',
      expense: 'Expense',
      filter: 'Filter',
      manualEntry: 'Manual Entry',
      table: {
        date: 'Date',
        desc: 'Description',
        category: 'Category',
        amount: 'Amount',
        actions: 'Actions'
      },
      pagination: {
        showing: 'Showing',
        of: 'of',
        entries: 'entries'
      },
      prompts: {
        name: 'Enter transaction name:',
        amount: 'Enter amount (positive for income, negative for expense):'
      },
      editTransaction: 'Edit Transaction',
      saveChanges: 'Save Changes'
    },
    budget: {
      title: 'Monthly Budget',
      subtitle: 'Manage your spending limits per category.',
      addBudget: 'Add Budget',
      totalBudget: 'Total Budget',
      remaining: 'Remaining',
      spending: 'Spent',
      modal: {
        categoryPrompt: 'Enter budget category name (e.g., Food, Transport):',
        existsAlert: 'Budget for this category already exists!',
        limitPrompt: 'Enter budget limit:',
        invalidAlert: 'Invalid amount!'
      },
      status: {
        safe: 'Safe',
        overbudget: 'Over Budget',
        onTrack: 'On Track',
        overbudgetExcl: 'Overbudget!'
      },
      alert: {
        overbudgetTitle: 'Warning: Over Budget!',
        overbudgetDesc: 'Your total expenses have exceeded the monthly budget limit by '
      },
      deleteConfirm: 'Delete budget for {category}?',
      monthlyTarget: 'Monthly Target',
      resetTooltip: 'Reset to category total',
      resetButton: 'Reset',
      categoryDetails: 'Category Details',
      editBudget: 'Edit Budget',
      emptyState: {
        title: 'No budgets set',
        subtitle: 'Create a budget to control your spending!'
      }
    },
    debts: {
      title: 'Debt Management',
      subtitle: 'Track who owes you or who you owe.',
      addDebt: 'Add Record',
      totalDebt: 'Total Debt (I Owe)',
      totalReceivables: 'Total Receivables (They Owe)',
      tabs: {
        debt: 'Debts (I Owe)',
        receivable: 'Receivables (They Owe)'
      },
      table: {
        name: 'Name',
        amount: 'Amount',
        remaining: 'Remaining',
        dueDate: 'Due Date',
        status: 'Status',
        actions: 'Actions',
        paid: 'Paid',
        unpaid: 'Unpaid'
      },
      searchPlaceholder: 'Search name or description...',
      payAction: 'Pay',
      paymentProgress: 'Payment Progress',
      paymentHistory: 'Payment History',
      noPaymentHistory: 'No payment history yet.',
      emptyState: {
        debt: {
          title: 'Hooray! Debt Free',
          subtitle: 'No debt records at the moment.'
        },
        receivable: {
          title: 'No receivables yet',
          subtitle: 'Everyone paid up, or no one owes you yet?'
        }
      },
      modal: {
        title: 'Add New Record',
        editTitle: 'Edit Record',
        typeLabel: 'Record Type',
        debtType: 'Debt (I Borrowed)',
        receivableType: 'Receivable (I Lent)',
        personLabel: 'Person/Entity Name',
        personPlaceholder: 'e.g. John, Bank ABC',
        amountLabel: 'Amount',
        dateLabel: 'Transaction Date',
        dueDateLabel: 'Due Date (Optional)',
        descLabel: 'Description',
        save: 'Save',
        payTitle: 'Pay Debt',
        payAmount: 'Payment Amount',
        payNote: 'Payment Note',
        payButton: 'Pay Now',
        totalDebtLabel: 'Total Debt',
        totalReceivableLabel: 'Total Receivable',
        alreadyPaid: 'Already paid:',
        remaining: 'Remaining:'
      }
    },
    categories: {
      title: 'Categories',
      subtitle: 'View spending summary by category.',
      infoButton: 'Category Info',
      addCategory: 'Add Category',
      infoAlert: 'Categories will be automatically created when you add a new transaction with that category name!',
      tipsLabel: 'Tips:',
      gotIt: 'Got it',
      saveCategory: 'Save Category',
      tips: [
        'Categories are automatically created when you add a transaction with a new category name.',
        'Use consistent naming (e.g., "Food" vs "food") to keep them grouped.',
        'You can set budgets for each category in the Budget tab.'
      ],
      searchPlaceholder: 'Search categories...',
      tabs: {
        all: 'All',
        expense: 'Expense',
        income: 'Income'
      },
      card: {
        transactions: 'transactions',
        activity: 'Activity'
      },
      emptyState: {
        title: 'No category data',
        subtitle: 'Data will appear after you add transactions.'
      },
      items: {
        food: 'Food',
        transport: 'Transport',
        housing: 'Housing',
        entertainment: 'Entertainment',
        health: 'Health',
        shopping: 'Shopping',
        education: 'Education',
        utilities: 'Bills',
        other: 'Other',
        salary: 'Salary',
        bonus: 'Bonus',
        investment: 'Investment',
        gift: 'Gift',
        business: 'Business Income',
        otherIncome: 'Other Income'
      },
      default: [
        'Food',
        'Transport',
        'Shopping',
        'Entertainment',
        'Bills',
        'Health',
        'Education',
        'Rent/Mortgage',
        'Insurance',
        'Savings',
        'Emergency Fund',
        'Charity',
        'Subscriptions',
        'Personal Care',
        'Pets',
        'Other'
      ]
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize the app to your needs.',
      appPreferences: 'App Preferences',
      appPreferencesDesc: 'Choose your preferred language and currency format.',
      currency: 'Currency',
      wip: '(Work in Progress)',
      wipDesc: 'This feature is currently under development and not yet available.',
      currencyIDR: 'Indonesian Rupiah',
      currencyUSD: 'United States Dollar',
      language: 'Language',
      dataManagement: 'Data Management',
      dataManagementDesc: 'Backup or restore your application data.',
      exportJson: 'Export Data (JSON)',
      importJson: 'Import Data (JSON)',
      about: 'About App',
      createdBy: 'Created by',
      save: 'Save Changes',
      savedAlert: 'Settings saved successfully!',
      importAlert: 'Data imported successfully!',
      importError: 'Failed to import data. Please ensure valid JSON format.',
      didYouKnow: 'Did you know?',
      didYouKnowDesc: 'Your data is stored locally in this browser. Don\'t forget to export data regularly so it doesn\'t get lost!',
      profileSettings: 'Profile Settings',
      profileDesc: 'Manage your public profile and appearance.',
      displayName: 'Display Name',
      nameSessionInfo: 'Name is currently managed by login session.',
      tagline: '"Modern financial management solution"',
      support: 'Support on Saweria'
    },
    login: {
      welcome: 'Welcome to FinBro',
      subtitle: 'Manage your finances easily and chill.',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name...',
      button: 'Login'
    },
    common: {
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      success: 'Success',
      error: 'Error',
      fullscreen: 'Fullscreen',
      exitApp: 'Exit App',
      notifications: 'Notifications',
      markAllRead: 'Mark all read',
      noNotifications: 'No new notifications',
      history: 'History',
      undo: 'Undo',
      redo: 'Redo',
      cancel: 'Cancel',
      save: 'Save',
      noActions: 'No actions yet',
      deleteAll: 'Delete All',
      otherNotifications: 'other notifications',
      guest: 'Guest',
      user: 'User',
      profile: 'Profile',
      minimize: 'Minimize',
      maximize: 'Maximize',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      appName: 'FinBro Desktop'
    },
    profile: {
      title: 'Profile Picture',
      change: 'Change Picture',
      uploadNew: 'Upload a new photo',
      dragDrop: 'Drag & drop an image here, or click to select',
      supports: 'Supports: JPG, PNG, WEBP (Max 5MB)',
      minRes: 'Min 200x200px',
      savePhoto: 'Save Photo',
      zoom: 'Zoom',
      rotation: 'Rotation',
      edit: 'Edit Photo',
      updateSuccess: 'Updated successfully',
      uploading: 'Uploading...',
      errorSize: 'File too large (Max 5MB)',
      errorRes: 'Image resolution must be at least 200x200px',
      errorProcess: 'Failed to process image'
    }
  }
};
