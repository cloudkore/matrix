// js/supabase-gallery.js

// Initialize Supabase client
const SUPABASE_URL = 'https://izyvffrihiuwocphmaaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eXZmZnJpaGl1d29jcGhtYWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDA4ODMsImV4cCI6MjA2NTkxNjg4M30.7n0dqeeFhj197EvCoOfRFYuESbZ5Ls_-5zTVubhcB_I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GALLERY_BUCKET_NAME = 'storage';

// DOM Elements
const galleryContainer = document.getElementById('image-gallery');
const loadingIndicator = document.getElementById('loading-indicator'); // Initial page load indicator
const errorMessage = document.getElementById('error-message');
const noImagesMessage = document.getElementById('no-images-message');
const infiniteScrollLoading = document.getElementById('infinite-scroll-loading'); // New: Infinite scroll loading indicator

// Modal Elements
const imageModal = $('#imageModal'); // jQuery for Bootstrap Modal
const modalImage = document.getElementById('modalImage');
const imageModalLabel = document.getElementById('imageModalLabel');

// Category tab elements
const categoryTabs = document.querySelectorAll('.nav-link'); // Select all nav links

// Pagination and Infinite Scroll variables
let currentPage = 0;
const IMAGES_PER_PAGE = 100;
let currentCategoryFilter = 'all'; // Default filter
let isLoadingImages = false; // Flag to prevent multiple simultaneous loads
let allImagesLoaded = false; // Flag to indicate if all images for current filter are loaded

/**
 * Fetches image metadata from the Supabase database and displays them.
 * @param {boolean} clearGallery - True to clear the gallery before adding new images (for initial load or category change).
 */
async function fetchAndDisplayImages(clearGallery = true) {
    if (isLoadingImages || allImagesLoaded && !clearGallery) {
        return; // Prevent loading if already loading or all images are loaded (and not clearing)
    }

    isLoadingImages = true; // Set loading flag

    // Show appropriate loading indicator
    if (clearGallery) {
        loadingIndicator.style.display = 'block'; // Show main loading indicator for initial/category load
        galleryContainer.innerHTML = ''; // Clear gallery content
        currentPage = 0; // Reset page on clear or category change
        allImagesLoaded = false; // Reset all images loaded flag
    } else {
        infiniteScrollLoading.style.display = 'block'; // Show infinite scroll loading indicator
    }

    errorMessage.style.display = 'none';
    noImagesMessage.style.display = 'none';

    const offset = currentPage * IMAGES_PER_PAGE;

    try {
        let query = supabase.from('images').select('*');

        // Apply category filter if not 'all'
        if (currentCategoryFilter !== 'all') {
            query = query.eq('category', currentCategoryFilter);
        }

        // Add ordering and range for pagination
        const { data: images, error } = await query
            .order('uploaded_at', { ascending: false })
            .range(offset, offset + IMAGES_PER_PAGE - 1); // Supabase range is inclusive

        if (error) {
            console.error('Error fetching image metadata:', error.message);
            errorMessage.style.display = 'block';
            return;
        }

        if (!images || images.length === 0) {
            // If no images on current page AND gallery is empty (initial load or category switch)
            if (galleryContainer.children.length === 0) {
                noImagesMessage.style.display = 'block';
            }
            allImagesLoaded = true; // No more images to load for this category
            return;
        }

        // Display images
        images.forEach(imageRecord => {
            const { data: publicUrlData } = supabase.storage
                .from(GALLERY_BUCKET_NAME)
                .getPublicUrl(imageRecord.storage_path, {
                    transform: {
                        width: 400,
                        height: 300,
                        resize: 'cover',
                        quality: 70
                    }
                });

            if (publicUrlData && publicUrlData.publicUrl) {
                const thumbnailUrl = publicUrlData.publicUrl;

                const colDiv = document.createElement('div');
                colDiv.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-4 text-center';

                const imgElement = document.createElement('img');
                imgElement.src = thumbnailUrl;
                imgElement.alt = imageRecord.name || 'Gallery Image';
                imgElement.className = 'img-thumbnail';
                imgElement.dataset.fullSizeUrl = supabase.storage // Store full size URL for modal
                                                    .from(GALLERY_BUCKET_NAME)
                                                    .getPublicUrl(imageRecord.storage_path).data.publicUrl;
                imgElement.dataset.imageName = imageRecord.name; // Store image name for modal title

                // Add click listener to open modal
                imgElement.addEventListener('click', function() {
                    modalImage.src = this.dataset.fullSizeUrl;
                    imageModalLabel.textContent = this.dataset.imageName;
                    imageModal.modal('show'); // Show the Bootstrap modal
                });

                // Add a span for the image name/title
                const titleSpan = document.createElement('span');
                titleSpan.className = 'd-block text-muted mt-1 text-truncate';
                titleSpan.textContent = imageRecord.name;

                colDiv.appendChild(imgElement); // Directly append img, no anchor
                colDiv.appendChild(titleSpan);
                galleryContainer.appendChild(colDiv);
            }
        });

        // If fewer images were returned than IMAGES_PER_PAGE, assume it's the last page
        if (images.length < IMAGES_PER_PAGE) {
            allImagesLoaded = true;
        } else {
            currentPage++; // Increment page for next load
        }

    } catch (error) {
        console.error('An unexpected error occurred during image fetching:', error);
        errorMessage.style.display = 'block';
        allImagesLoaded = true; // Stop infinite scroll on error
    } finally {
        isLoadingImages = false; // Reset loading flag
        loadingIndicator.style.display = 'none'; // Hide initial load indicator
        infiniteScrollLoading.style.display = 'none'; // Hide infinite scroll indicator
    }
}

// Infinite Scroll Logic
let scrollTimer = null; // For debouncing the scroll event

function handleScroll() {
    if (scrollTimer) {
        clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
        // Check if user has scrolled near the bottom of the page
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        // Load more images when within 300px of the bottom
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            fetchAndDisplayImages(false); // Don't clear gallery
        }
    }, 100); // Debounce scroll event by 100ms
}

// Initial call to fetch and display images when the document is ready
$(document).ready(function() {
    fetchAndDisplayImages(true); // Load 'all' images initially

    // Add event listeners for category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior

            // Remove 'active' class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add 'active' class to the clicked tab
            this.classList.add('active');

            // Update the current category filter
            currentCategoryFilter = this.dataset.categoryFilter;

            // Fetch and display images for the new category, clearing the gallery
            fetchAndDisplayImages(true);
        });
    });

    // Setup infinite scroll
    window.addEventListener('scroll', handleScroll);
});
