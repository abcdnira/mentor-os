package router

import (
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"mentor-os-api/internal/ai"
	"mentor-os-api/internal/config"
	"mentor-os-api/internal/handler"
	"mentor-os-api/internal/middleware"
	"mentor-os-api/internal/service"
)

func Setup(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS(cfg))

	// AI Provider
	aiProvider, err := ai.NewProvider(cfg)
	if err != nil {
		log.Fatalf("failed to create AI provider: %v", err)
	}

	// Services
	authSvc := service.NewAuthService(db, cfg)
	chatSvc := service.NewChatService(db, aiProvider)
	reflectionSvc := service.NewReflectionService(db, aiProvider)
	interviewSvc := service.NewInterviewService(db, aiProvider)
	projectSvc := service.NewProjectService(db, aiProvider)
	roadmapSvc := service.NewRoadmapService(db, aiProvider)
	resumeSvc := service.NewResumeService(db, aiProvider)
	codeAnalyzerSvc := service.NewCodeAnalyzerService(db, aiProvider)

	// Handlers
	authH := handler.NewAuthHandler(authSvc, cfg)
	chatH := handler.NewChatHandler(chatSvc)
	reflectionH := handler.NewReflectionHandler(reflectionSvc)
	knowledgeH := handler.NewKnowledgeHandler(db)
	capabilityH := handler.NewCapabilityHandler(db)
	dashboardH := handler.NewDashboardHandler(db)
	interviewH := handler.NewInterviewHandler(interviewSvc)
	projectH := handler.NewProjectHandler(projectSvc)
	roadmapH := handler.NewRoadmapHandler(roadmapSvc)
	resumeH := handler.NewResumeHandler(resumeSvc)
	codeUploadH := handler.NewCodeUploadHandler(codeAnalyzerSvc)

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "mentor-os-api"})
	})

	// Auth (public)
	auth := r.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/logout", authH.Logout)
	}

	// Protected routes
	p := r.Group("")
	p.Use(middleware.AuthRequired(authSvc))
	{
		p.GET("/auth/me", authH.Me)
		p.GET("/dashboard", dashboardH.Get)

		// Chat
		chat := p.Group("/chat/sessions")
		{
			chat.POST("", chatH.CreateSession)
			chat.GET("", chatH.ListSessions)
			chat.GET("/:id", chatH.GetSession)
			chat.POST("/:id/messages", chatH.SendMessage)
			chat.POST("/:id/reflection", reflectionH.GenerateReflection)
		}

		// Knowledge
		knowledge := p.Group("/knowledge")
		{
			knowledge.GET("", knowledgeH.List)
			knowledge.GET("/:id", knowledgeH.Get)
		}

		// Capabilities
		capabilities := p.Group("/capabilities")
		{
			capabilities.GET("", capabilityH.List)
			capabilities.GET("/:id", capabilityH.Get)
		}

		// Interview
		interview := p.Group("/interview")
		{
			interview.GET("/topics", interviewH.GetTopics)
			interview.POST("/start", interviewH.Start)
			interview.POST("/:id/answer", interviewH.Answer)
			interview.POST("/:id/evaluate", interviewH.Evaluate)
		}

		// Projects
		projects := p.Group("/projects")
		{
			projects.POST("", projectH.Create)
			projects.GET("", projectH.List)
			projects.GET("/:id", projectH.Get)
			projects.POST("/:id/analyze", projectH.Analyze)
			projects.POST("/:id/upload", codeUploadH.Upload)
		}

		// Roadmap
		roadmap := p.Group("/roadmap")
		{
			roadmap.GET("", roadmapH.List)
			roadmap.POST("/generate", roadmapH.Generate)
			roadmap.PUT("/:id/status", roadmapH.UpdateStatus)
		}

		// Resume
		p.POST("/resume/generate", resumeH.Generate)
	}

	return r
}
