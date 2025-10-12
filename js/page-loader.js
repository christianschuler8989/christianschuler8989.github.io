// ===== PAGE LOADER CLASS =====
class PageLoader {
    constructor() {
        this.container = document.getElementById('page-container');
        this.currentPage = null;
        this.pageData = {};
        
        this.init();
    }

    async init() {
        this.pageData = await this.loadDataWithValidation();
    }

    // ===== JSON DATA LOADING METHOD =====
    async loadSampleData() {
        try {
            // Define the data files to load
            const dataFiles = {
                home: 'data/home.json',
                projects: 'data/projects.json',
                publications: 'data/publications.json',
                events: 'data/events.json',
                researchs: 'data/researchs.json',
                talks: 'data/talks.json',
                supervisions: 'data/supervisions.json',
                teachings: 'data/teachings.json',
                services: 'data/services.json',
                literatures: 'data/literatures.json',
                about: 'data/about.json',
                portfolios: 'data/portfolios.json'
            };

            // Load all JSON files in parallel
            const loadPromises = Object.entries(dataFiles).map(async ([pageId, filePath]) => {
                try {
                    // console.log(`Loading ${pageId} data from ${filePath}...`);
                    
                    const response = await fetch(filePath);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} for file: ${filePath}`);
                    }
                    
                    const data = await response.json();
                    // console.log(`✅ Successfully loaded ${pageId} data`);
                    
                    return [pageId, data];
                    
                } catch (error) {
                    console.error(`❌ Error loading ${pageId} data from ${filePath}:`, error);
                    
                    // Return fallback data for this page
                    return [pageId, this.getFallbackData(pageId)];
                }
            });

            // Wait for all files to load
            const loadedData = await Promise.all(loadPromises);
            
            // Convert array of [key, value] pairs back to object
            const pageData = Object.fromEntries(loadedData);
            
            console.log('🎉 All page data loaded successfully:', Object.keys(pageData));
            return pageData;
            
        } catch (error) {
            console.error('❌ Critical error in data loading:', error);
            
            // Return complete fallback data if everything fails
            return this.getCompleteFallbackData();
        }
    }

    // ===== FALLBACK DATA METHODS =====
    getFallbackData(pageId) {
        const fallbackData = {
            home: {
                title: "Welcome to My Research Hub",
                subtitle: "Exploring Computational Linguistics & Low-Resource Languages",
                rootHexagon: {
                    type: "profile",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZTBmMmYxIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDgiIHI9IjE4IiBmaWxsPSIjMmQ3ZDMyIi8+CjxwYXRoIGQ9Ik0zMCA5MEM2MCA3NSA5MCA3NSAxMjAgOTBMMzAgOTBaIiBmaWxsPSIjMmQ3ZDMyIi8+Cjx0ZXh0IHg9IjYwIiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5KRDI8L3RleHQ+Cjx0ZXh0IHg9IjYwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzJkN2QzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVzZWFyY2hlcjwvdGV4dD4KPC9zdmc+",
                    title: "Dr. Jane Researcher",
                    subtitle: "PhD Computational Linguistics"
                },
                contentHexagons: [
                    {
                        type: "info",
                        icon: "🎯",
                        title: "Research Focus",
                        subtitle: "NLP & Low-Resource Languages",
                        position: { row: 0, col: 1 }
                    },
                    {
                        type: "info",
                        icon: "🌍",
                        title: "Global Impact",
                        subtitle: "Language Preservation",
                        position: { row: 1, col: 0 }
                    },
                    {
                        type: "info",
                        icon: "🤝",
                        title: "Collaboration",
                        subtitle: "Community-Driven Research",
                        position: { row: 1, col: 1 }
                    },
                    {
                        type: "info",
                        icon: "📊",
                        title: "Data Collection",
                        subtitle: "5+ Active Studies",
                        position: { row: 0, col: 2 }
                    }
                ]
            },
            projects: {
                title: "Projects",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "project",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            publications: {
                title: "Scientific Publications",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "publication",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            events: {
                title: "Events",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "event",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            researchs: {
                title: "Research Vision",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "research",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            talks: {
                title: "Invited Talks",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "talk",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            supervisions: {
                title: "Supervised Students",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "supervision",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            teachings: {
                title: "Teaching",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "teaching",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            services: {
                title: "Service",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "service",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            literatures: {
                title: "Related Literatures",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "literature",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            about: {
                title: "Personal Information",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "info",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            },
            portfolios: {
                title: "Portfolio",
                subtitle: "Fallback data",
                rootHexagon: {
                    type: "image",
                    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZmZmM2UwIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWY2YzAwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZmNmY2ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TExNIFJlc2VhcmNoPC90ZXh0Pgo8L3N2Zz4=",
                    title: "Fallback data title",
                    subtitle: "Fallback data subtitle"
                },
                contentHexagons: [
                    {
                        type: "portfolio",
                        icon: "🗣️",
                        title: "Fallback",
                        subtitle: "Fallback data",
                        status: "Active",
                        position: { row: 0, col: 1 }
                    }
                ]
            }
        };

        return fallbackData[pageId] || fallbackData.home;
    }

    getCompleteFallbackData() {
        return {
            home: this.getFallbackData('home'),
            projects: this.getFallbackData('projects'), 
            publications: this.getFallbackData('publications'), 
            events: this.getFallbackData('events'), 
            researchs: this.getFallbackData('researchs'), 
            talks: this.getFallbackData('talks'), 
            supervisions: this.getFallbackData('supervisions'), 
            teachings: this.getFallbackData('teachings'), 
            services: this.getFallbackData('services'), 
            literatures: this.getFallbackData('literatures'),
            about: this.getFallbackData('about'),
            portfolios: this.getFallbackData('portfolios')
        };
    }

    // ===== UTILITY METHOD FOR VALIDATING JSON STRUCTURE =====
    validatePageData(pageId, data) {
        // Basic validation to ensure required fields exist
        const requiredFields = ['title', 'subtitle', 'rootHexagon'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                console.warn(`⚠️ Missing required field '${field}' in ${pageId} data`);
                return false;
            }
        }
        
        // Validate root hexagon structure
        const rootHex = data.rootHexagon;
        if (!rootHex.type || !rootHex.title || !rootHex.subtitle) {
            console.warn(`⚠️ Invalid rootHexagon structure in ${pageId} data`);
            return false;
        }
        
        // Validate content hexagons if they exist
        if (data.contentHexagons && Array.isArray(data.contentHexagons)) {
            for (let i = 0; i < data.contentHexagons.length; i++) {
                const hex = data.contentHexagons[i];
                if (!hex.type || !hex.title || !hex.position) {
                    console.warn(`⚠️ Invalid contentHexagon at index ${i} in ${pageId} data`);
                    // Don't return false, just warn - we can still use partial data
                }
            }
        }
        
        // console.log(`✅ ${pageId} data validation passed`);
        return true;
    }

    // ===== ENHANCED LOADING WITH VALIDATION =====
    async loadDataWithValidation() {
        const rawData = await this.loadSampleData(); // This now loads from JSON files
        const validatedData = {};
        
        for (const [pageId, data] of Object.entries(rawData)) {
            if (this.validatePageData(pageId, data)) {
                validatedData[pageId] = data;
            } else {
                console.error(`❌ Data validation failed for ${pageId}, using fallback`);
                validatedData[pageId] = this.getFallbackData(pageId);
            }
        }
        
        return validatedData;
    }

    async loadPage(pageId) {
        console.log('Loading page with pageId:', pageId)
        try {
            // Handle sub-pages
            if (pageId.includes('/')) {
                const [section, subId] = pageId.split('/');
                await this.loadSubPage(section, subId);
            } else {
                const pageData = this.pageData[pageId];
                if (!pageData) {
                    throw new Error(`Page data not found for: ${pageId}`);
                }
                this.renderPage(pageData, pageId);
            }

            this.currentPage = pageId;
            this.addPageAnimations(); // Applies to both main and sub-pages (can be adjusted)
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error loading page:', error);
            this.renderErrorPage(pageId);
            return Promise.reject(error);
        }
    }

    // Method to load sub-page content
    async loadSubPage(section, subId) {
        console.log('Loading subpage with section:', section, ' and subId:', subId)
        try {
            const url = `pages/${section}/${subId}/index.html`; // Assumes index.html in sub-dir
            console.log(`Loading sub-page from ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            this.container.innerHTML = html;

            // Add back button
            const backButton = document.createElement('button');
            backButton.className = 'back-button';
            backButton.textContent = `Back to ${section.charAt(0).toUpperCase() + section.slice(1)}`;
            backButton.onclick = () => {
                history.back();
            };
            this.container.insertBefore(backButton, this.container.firstChild);

            // Optional: Add animations or other post-load logic
        } catch (error) {
            console.error('Error loading sub-page:', error);
            this.renderErrorPage(`${section}/${subId}`);
        }
    }

    renderPage(pageData, pageId) {
        this.container.innerHTML = `
            <div class="page-content fade-in">
                <div class="hex-pattern-container">
                    ${this.renderRootHexagon(pageData.rootHexagon, pageId)}
                    ${this.renderContentHexagons(pageData.contentHexagons, pageId)}
                </div>
            </div>
        `;
        // To add a title to each page, add this above in front of hex-pattern-container
        // <div class="page-title">
        //      <h1>${pageData.title}</h1>
        //      <p>${pageData.subtitle}</p>
        // </div>

        // Add staggered animations
        this.addPageAnimations();
    }

    renderRootHexagon(rootData, pageId) {
        const hexagonClass = `content-hexagon root hexagon-${rootData.type}`;
        
        let content = '';
        if (rootData.type === 'profile') {
            content = `
                <img src="${rootData.image}" alt="Profile" class="root-image" />
                <div class="root-title">${rootData.title}</div>
                <div class="root-subtitle">${rootData.subtitle}</div>
            `;
        } else if (rootData.type === 'image') {
            content = `
                <img src="${rootData.image}" alt="${rootData.title}" class="root-image" />
                <div class="root-title">${rootData.title}</div>
                <div class="root-subtitle">${rootData.subtitle}</div>
            `;
        }

        return `
            <div class="${hexagonClass} loading" style="position: absolute; left: 50px; top: 50px;">
                <div class="hexagon-inner">
                    <div class="hexagon-shape"></div>
                    <div class="hexagon-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    renderContentHexagons(hexagons, pageId) {
        if (!hexagons || hexagons.length === 0) {
            return '';
        }

        return hexagons.map((hex, index) => {
            const position = this.calculateHexagonPosition(hex.position);
            const hexagonClass = `content-hexagon hexagon-${hex.type}`;
            
            let content = this.getHexagonContent(hex);

            // Add data attributes, tabindex, role, and aria for interactivity
            return `
                <div class="${hexagonClass} loading" 
                     style="position: absolute; left: ${position.x}px; top: ${position.y}px;"
                     data-delay="${index * 100}"
                     data-type="${hex.type}"
                     data-id="${hex.id || ''}"
                     tabindex="0"
                     role="button"
                     aria-label="View details for ${hex.title}">
                    <div class="hexagon-inner">
                        <div class="hexagon-shape"></div>
                        <div class="hexagon-content">
                            ${content}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getHexagonContent(hex) {
        switch(hex.type) {
            case 'project':
                return `
                    <div class="project-icon">${hex.icon}</div>
                    <div class="project-title">${hex.title}</div>
                    <div class="project-status">${hex.status || hex.subtitle}</div>
                `;
            case 'event':
                return `
                    <div class="event-icon">${hex.icon}</div>
                    <div class="event-title">${hex.title}</div>
                    <div class="event-status">${hex.status || hex.subtitle}</div>
                `;
            case 'literature':
                return `
                    <div class="literature-icon">${hex.icon}</div>
                    <div class="literature-title">${hex.title}</div>
                    <div class="literature-count">${hex.count || hex.subtitle}</div>
                `;
            case 'info':
            default:
                return `
                    <div class="section-icon">${hex.icon}</div>
                    <div class="section-title">${hex.title}</div>
                    <div class="section-count">${hex.subtitle}</div>
                `;
        }
    }

    calculateHexagonPosition(gridPos) {
        const baseX = -150;
        const baseY = -150;
        const hexWidth = 420; // Content hexagon width + spacing
        const hexHeight = 320; // Hexagon height + spacing
        const offsetX = 205; // Half hexagon width for offset rows
        const offsetY = 1; // Half hexagon height for offset rows

        return {
            x: baseX + (gridPos.col * hexWidth) + offsetX + (gridPos.row % 2 === 1 ? offsetX : 0),
            y: baseY + (gridPos.row * hexHeight) + (gridPos.col * offsetY) + 200 // Offset from root hexagon
        };
    }

    addPageAnimations() {
        // Animate root hexagon first
        setTimeout(() => {
            const rootHex = this.container.querySelector('.root');
            if (rootHex) {
                rootHex.classList.remove('loading');
            }
        }, 200);

        // Animate content hexagons with staggered delays
        const contentHexagons = this.container.querySelectorAll('.content-hexagon:not(.root)');
        contentHexagons.forEach((hex, index) => {
            const delay = parseInt(hex.dataset.delay) || (index * 150);
            setTimeout(() => {
                hex.classList.remove('loading');
            }, 400 + delay);
        });
    }

    renderErrorPage(pageId) {
        this.container.innerHTML = `
            <div class="page-content fade-in">
                <div class="page-title">
                    <h1>Page Not Found</h1>
                    <p>Sorry, the page "${pageId}" could not be loaded.</p>
                </div>
                <div class="hex-pattern-container">
                    <div class="content-hexagon root hexagon-info loading" style="position: absolute; left: 50px; top: 50px;">
                        <div class="hexagon-inner">
                            <div class="hexagon-shape"></div>
                            <div class="hexagon-content">
                                <div class="section-icon">❌</div>
                                <div class="root-title">Error</div>
                                <div class="root-subtitle">Page Not Found</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const errorHex = this.container.querySelector('.root');
            if (errorHex) {
                errorHex.classList.remove('loading');
            }
        }, 200);
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// ===== INITIALIZE PAGE LOADER =====
document.addEventListener('DOMContentLoaded', () => {
    window.pageLoader = new PageLoader();
});
