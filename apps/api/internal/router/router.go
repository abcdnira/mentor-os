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

	// Handlers
	authH := handler.NewAuthHandler(authSvc, cfg)
	chatH := handler.NewChatHandler(chatSvc)
	reflectionH := handler.NewReflectionHandler(reflectionSvc)
	knowledgeH := handler.NewKnowledgeHandler(db)
	capabilityH := handler.NewCapabilityHandler(db)
	dashboardH := handler.NewDashboardHandler(db)

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "mentor-os-api"})
	})

	// Auth routes (public)
	auth := r.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/logout", authH.Logout)
	}

	// Protected routes
	protected := r.Group("")
	protected.Use(middleware.AuthRequired(authSvc))
	{
		protected.GET("/auth/me", authH.Me)

		// Dashboard
		protected.GET("/dashboard", dashboardH.Get)

		// Chat
		chat := protected.Group("/chat/sessions")
		{
			chat.POST("", chatH.CreateSession)
			chat.GET("", chatH.ListSessions)
			chat.GET("/:id", chatH.GetSession)
			chat.POST("/:id/messages", chatH.SendMessage)
			chat.POST("/:id/reflection", reflectionH.GenerateReflection)
		}

		// Knowledge
		knowledge := protected.Group("/knowledge")
		{
			knowledge.GET("", knowledgeH.List)
			knowledge.GET("/:id", knowledgeH.Get)
		}

		// Capabilities
		capabilities := protected.Group("/capabilities")
		{
			capabilities.GET("", capabilityH.List)
			capabilities.GET("/:id", capabilityH.Get)
		}
	}

	return r
}
