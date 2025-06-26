// College search and display functionality
class CollegeSearch {
    constructor() {
        this.searchForm = document.getElementById('collegeSearchForm');
        this.searchQuery = document.getElementById('searchQuery');
        this.locationFilter = document.getElementById('locationFilter');
        this.typeFilter = document.getElementById('typeFilter');
        this.resultsContainer = document.getElementById('collegeResults');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.noResults = document.getElementById('noResults');
        this.gridViewBtn = document.getElementById('gridView');
        this.listViewBtn = document.getElementById('listView');
        
        this.currentView = 'grid';
        this.allColleges = [];
        this.filteredColleges = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupViewToggle();
    }

    setupEventListeners() {
        // Search form submission
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Real-time search (debounced)
        this.searchQuery.addEventListener('input', 
            AcademicBot.debounce(() => this.performSearch(), 300)
        );

        // Filter changes
        this.locationFilter.addEventListener('change', () => this.performSearch());
        this.typeFilter.addEventListener('change', () => this.performSearch());

        // View toggle buttons
        this.gridViewBtn?.addEventListener('click', () => this.switchView('grid'));
        this.listViewBtn?.addEventListener('click', () => this.switchView('list'));
    }

    setupViewToggle() {
        if (!this.gridViewBtn || !this.listViewBtn) return;
        
        this.gridViewBtn.classList.add('active');
        this.listViewBtn.classList.remove('active');
    }

    loadInitialData() {
        // Get colleges from the page (server-rendered)
        const collegeCards = document.querySelectorAll('.college-card');
        this.allColleges = Array.from(collegeCards).map(card => ({
            element: card,
            name: card.getAttribute('data-name'),
            location: card.getAttribute('data-location'),
            type: card.getAttribute('data-type')
        }));
        
        this.filteredColleges = [...this.allColleges];
        this.updateResultsCount();
    }

    async performSearch() {
        const query = this.searchQuery.value.trim().toLowerCase();
        const location = this.locationFilter.value.toLowerCase();
        const type = this.typeFilter.value.toLowerCase();

        // Show loading state
        this.showLoading();

        try {
            // For client-side filtering (fast response)
            this.filteredColleges = this.allColleges.filter(college => {
                const matchesQuery = !query || 
                    college.name.includes(query) || 
                    college.element.textContent.toLowerCase().includes(query);
                
                const matchesLocation = !location || college.location.includes(location);
                const matchesType = !type || college.type.includes(type);
                
                return matchesQuery && matchesLocation && matchesType;
            });

            // Simulate API delay for demonstration
            await new Promise(resolve => setTimeout(resolve, 500));

            this.displayResults();
            this.updateResultsCount();

        } catch (error) {
            console.error('Search error:', error);
            AcademicBot.showError('An error occurred during search. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async performAdvancedSearch() {
        const query = this.searchQuery.value.trim();
        const location = this.locationFilter.value;
        const type = this.typeFilter.value;

        this.showLoading();

        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (location) params.append('location', location);
            if (type) params.append('type', type);

            const response = await AcademicBot.get(`/api/colleges/search?${params}`);

            if (response.success) {
                this.displayApiResults(response.data.colleges);
                this.updateResultsCount(response.data.total);
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            console.error('Advanced search error:', error);
            AcademicBot.showError('Search failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayResults() {
        // Hide all college cards first
        this.allColleges.forEach(college => {
            college.element.style.display = 'none';
        });

        // Show filtered results
        if (this.filteredColleges.length === 0) {
            this.noResults.style.display = 'block';
            this.resultsContainer.style.display = 'none';
        } else {
            this.noResults.style.display = 'none';
            this.resultsContainer.style.display = 'flex';
            
            this.filteredColleges.forEach(college => {
                college.element.style.display = 'block';
                // Add entrance animation
                college.element.classList.add('fade-in');
            });
        }
    }

    displayApiResults(colleges) {
        this.resultsContainer.innerHTML = '';
        
        if (colleges.length === 0) {
            this.noResults.style.display = 'block';
            this.resultsContainer.style.display = 'none';
            return;
        }

        this.noResults.style.display = 'none';
        this.resultsContainer.style.display = 'flex';

        colleges.forEach(college => {
            const collegeCard = this.createCollegeCard(college);
            this.resultsContainer.appendChild(collegeCard);
        });
    }

    createCollegeCard(college) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 col-lg-4 college-card fade-in';
        
        colDiv.innerHTML = `
            <div class="card h-100 shadow-sm border-0 college-item">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title fw-bold text-primary mb-0">${college.name}</h5>
                        <span class="badge bg-primary">${college.type || 'University'}</span>
                    </div>
                    
                    <div class="college-info mb-3">
                        <p class="text-muted mb-2">
                            <i class="fas fa-map-marker-alt me-2"></i>${college.location}
                        </p>
                        <p class="card-text">${college.description?.substring(0, 100) || 'No description available'}...</p>
                    </div>
                    
                    <div class="college-stats mb-3">
                        <div class="row g-2 text-center">
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="fw-semibold text-primary">${college.students || 'N/A'}</div>
                                    <small class="text-muted">Students</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="fw-semibold text-success">${college.acceptance_rate || 'N/A'}%</div>
                                    <small class="text-muted">Acceptance</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="stat-item">
                                    <div class="fw-semibold text-info">${college.ranking || 'N/A'}</div>
                                    <small class="text-muted">Ranking</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${college.popular_programs ? `
                    <div class="college-programs mb-3">
                        <h6 class="fw-semibold mb-2">Popular Programs:</h6>
                        <div class="d-flex flex-wrap gap-1">
                            ${college.popular_programs.slice(0, 3).map(program => 
                                `<span class="badge bg-light text-dark">${program}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="card-footer bg-transparent border-0">
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm flex-fill" 
                                onclick="viewCollegeDetails(${college.id})">
                            <i class="fas fa-info-circle me-1"></i>Details
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" 
                                onclick="saveCollege(${college.id})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return colDiv;
    }

    switchView(viewType) {
        this.currentView = viewType;
        
        // Update button states
        if (viewType === 'grid') {
            this.gridViewBtn?.classList.add('active');
            this.listViewBtn?.classList.remove('active');
            this.resultsContainer.className = 'row g-4';
        } else {
            this.listViewBtn?.classList.add('active');
            this.gridViewBtn?.classList.remove('active');
            this.resultsContainer.className = 'row g-2';
            
            // Modify cards for list view
            const cards = this.resultsContainer.querySelectorAll('.col-md-6');
            cards.forEach(card => {
                card.className = 'col-12';
            });
        }
    }

    updateResultsCount(count = null) {
        const displayCount = count !== null ? count : this.filteredColleges.length;
        if (this.resultsCount) {
            this.resultsCount.textContent = displayCount;
        }
    }

    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
        if (this.resultsContainer) {
            this.resultsContainer.style.opacity = '0.5';
        }
    }

    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
        if (this.resultsContainer) {
            this.resultsContainer.style.opacity = '1';
        }
    }

    // Public methods for external use
    clearFilters() {
        this.searchQuery.value = '';
        this.locationFilter.value = '';
        this.typeFilter.value = '';
        this.performSearch();
    }

    searchByKeyword(keyword) {
        this.searchQuery.value = keyword;
        this.performSearch();
    }
}

// Global functions for college interactions
async function viewCollegeDetails(collegeId) {
    const modal = new bootstrap.Modal(document.getElementById('collegeModal'));
    const modalTitle = document.getElementById('collegeModalTitle');
    const modalBody = document.getElementById('collegeModalBody');
    
    // Show loading state
    modalTitle.textContent = 'Loading...';
    modalBody.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    modal.show();
    
    try {
        const response = await AcademicBot.get(`/api/college/${collegeId}`);
        
        if (response.success) {
            const college = response.data;
            modalTitle.textContent = college.name;
            modalBody.innerHTML = createCollegeDetailsHTML(college);
        } else {
            modalBody.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load college details. Please try again.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading college details:', error);
        modalBody.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                An error occurred loading college details.
            </div>
        `;
    }
}

function createCollegeDetailsHTML(college) {
    return `
        <div class="college-details">
            <div class="row mb-4">
                <div class="col-md-8">
                    <h6 class="fw-semibold mb-2">About</h6>
                    <p>${college.description || 'No detailed description available.'}</p>
                </div>
                <div class="col-md-4">
                    <div class="college-quick-stats">
                        <div class="stat-row mb-2">
                            <strong>Type:</strong> ${college.type || 'N/A'}
                        </div>
                        <div class="stat-row mb-2">
                            <strong>Location:</strong> ${college.location || 'N/A'}
                        </div>
                        <div class="stat-row mb-2">
                            <strong>Students:</strong> ${college.students || 'N/A'}
                        </div>
                        <div class="stat-row mb-2">
                            <strong>Acceptance Rate:</strong> ${college.acceptance_rate || 'N/A'}%
                        </div>
                    </div>
                </div>
            </div>
            
            ${college.popular_programs ? `
            <div class="mb-4">
                <h6 class="fw-semibold mb-3">Popular Programs</h6>
                <div class="row g-2">
                    ${college.popular_programs.map(program => `
                        <div class="col-md-4">
                            <div class="badge bg-primary w-100 p-2">${program}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${college.admission_requirements ? `
            <div class="mb-4">
                <h6 class="fw-semibold mb-3">Admission Requirements</h6>
                <ul class="list-unstyled">
                    ${college.admission_requirements.map(req => `
                        <li class="mb-1">
                            <i class="fas fa-check-circle text-success me-2"></i>${req}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            <div class="text-center">
                <button class="btn btn-outline-primary me-2" onclick="addToFavorites(${college.id})">
                    <i class="fas fa-heart me-1"></i>Add to Favorites
                </button>
                <button class="btn btn-outline-info" onclick="compareCollege(${college.id})">
                    <i class="fas fa-balance-scale me-1"></i>Compare
                </button>
            </div>
        </div>
    `;
}

function saveCollege(collegeId) {
    // This would typically save to user's favorites
    AcademicBot.showToast('College added to your saved list!', 'success');
}

function addToFavorites(collegeId) {
    // Add to favorites functionality
    AcademicBot.showToast('College added to favorites!', 'success');
}

function compareCollege(collegeId) {
    // College comparison functionality
    AcademicBot.showToast('College comparison feature coming soon!', 'info');
}

// Initialize college search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('collegeSearchForm')) {
        window.collegeSearch = new CollegeSearch();
    }
});

// Export for global access
window.CollegeSearch = CollegeSearch;
