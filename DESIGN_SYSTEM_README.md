# 🎨 Fitness Challenge App Design System

A comprehensive design system for consistent, beautiful, and maintainable UI components across the Fitness Challenge application.

## 📚 Table of Contents

- [Overview](#overview)
- [Design Tokens](#design-tokens)
- [Component Library](#component-library)
- [Layout System](#layout-system)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## 🎯 Overview

This design system provides:
- **Consistent visual language** across all pages
- **Reusable components** for faster development
- **Design tokens** for colors, spacing, and typography
- **Layout patterns** for common page structures
- **Accessibility standards** built into every component

## 🎨 Design Tokens

### Colors

```typescript
import { designSystem } from '@/src/lib/design-system'

// Primary colors (Blue)
designSystem.colors.primary[500] // #3b82f6

// Secondary colors (Purple)
designSystem.colors.secondary[500] // #a855f7

// Challenge type colors
designSystem.colors.challengeTypes.fitness.main // #3b82f6
designSystem.colors.challengeTypes['weight-loss'].main // #22c55e
```

### Typography

```typescript
// Font sizes
designSystem.typography.fontSize['2xl'] // 1.5rem (24px)

// Font weights
designSystem.typography.fontWeight.bold // 700

// Line heights
designSystem.typography.lineHeight.relaxed // 1.625
```

### Spacing

```typescript
// Consistent spacing scale
designSystem.spacing.md // 1rem (16px)
designSystem.spacing.lg // 1.5rem (24px)
designSystem.spacing.xl // 2rem (32px)
```

### Shadows

```typescript
// Elevation system
designSystem.shadows.sm // Subtle shadows
designSystem.shadows.lg // Medium shadows
designSystem.shadows['2xl'] // Strong shadows
```

## 🧩 Component Library

### EnhancedCard

A flexible card component with multiple variants and consistent styling.

```typescript
import { EnhancedCard, StatsCard, FeatureCard } from '@/src/components/ui/EnhancedCard'

// Basic card
<EnhancedCard variant="glass" padding="lg">
  <h3>Card Content</h3>
</EnhancedCard>

// Stats card
<StatsCard 
  icon={<Calendar className="w-6 h-6" />}
  title="Total Days"
  value="30"
  subtitle="Challenge Duration"
/>

// Feature card
<FeatureCard
  icon={<Target className="w-6 h-6" />}
  title="Goal Setting"
  description="Set and track your fitness goals"
/>
```

**Variants:**
- `default` - Standard white card with shadow
- `glass` - Semi-transparent with backdrop blur
- `elevated` - Strong shadow for emphasis

**Props:**
- `variant` - Card style variant
- `padding` - Internal spacing (sm, md, lg, xl)
- `hover` - Enable hover effects
- `border` - Show/hide border
- `shadow` - Shadow intensity

### EnhancedButton

A comprehensive button system with multiple variants and states.

```typescript
import { EnhancedButton, IconButton, FloatingActionButton } from '@/src/components/ui/EnhancedButton'

// Primary button
<EnhancedButton variant="primary" size="lg">
  Join Challenge
</EnhancedButton>

// Icon button
<IconButton variant="primary" size="md">
  <Plus className="w-5 h-5" />
</IconButton>

// Floating action button
<FloatingActionButton variant="primary" size="lg">
  <Plus className="w-6 h-6" />
</FloatingActionButton>
```

**Variants:**
- `primary` - Blue to purple gradient
- `secondary` - White with border
- `outline` - Bordered with hover fill
- `ghost` - Minimal styling
- `success` - Green gradient
- `warning` - Yellow to orange gradient
- `danger` - Red gradient

**Sizes:**
- `sm` - Small (px-4 py-2)
- `md` - Medium (px-6 py-3)
- `lg` - Large (px-8 py-4)
- `xl` - Extra large (px-10 py-5)

## 🏗️ Layout System

### PageContainer

Consistent page layout with configurable width and padding.

```typescript
import { PageContainer } from '@/src/components/ui/LayoutSystem'

<PageContainer maxWidth="7xl" padding="lg">
  <h1>Page Content</h1>
</PageContainer>
```

### HeroSection

Beautiful hero sections with background options.

```typescript
import { HeroSection } from '@/src/components/ui/LayoutSystem'

<HeroSection background="pattern">
  <h1>Welcome to Fitness Challenges</h1>
  <p>Transform your life with our amazing programs</p>
</HeroSection>
```

**Background Options:**
- `default` - Clean white
- `gradient` - Subtle blue gradient
- `glass` - Semi-transparent
- `pattern` - Decorative blur patterns

### SectionContainer

Organized content sections with titles and consistent spacing.

```typescript
import { SectionContainer } from '@/src/components/ui/LayoutSystem'

<SectionContainer 
  title="Our Challenges" 
  subtitle="Choose from a variety of fitness programs"
  padding="lg"
>
  <GridLayout columns={3} gap="lg">
    {/* Challenge cards */}
  </GridLayout>
</SectionContainer>
```

### GridLayout & FlexLayout

Responsive grid and flexbox layouts.

```typescript
import { GridLayout, FlexLayout } from '@/src/components/ui/LayoutSystem'

// Responsive grid
<GridLayout columns={3} gap="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</GridLayout>

// Flexible layout
<FlexLayout 
  direction="row" 
  justify="between" 
  align="center"
  gap="md"
>
  <div>Left content</div>
  <div>Right content</div>
</FlexLayout>
```

## 💡 Usage Examples

### Challenge Card with Design System

```typescript
import { EnhancedCard, EnhancedButton } from '@/src/components/ui'
import { designSystem } from '@/src/lib/design-system'

const ChallengeCard = ({ challenge }) => {
  const typeColors = designSystem.colors.challengeTypes[challenge.challengeType]
  
  return (
    <EnhancedCard variant="glass" hover>
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
          {/* Content */}
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {challenge.name}
          </h3>
          <div className="mt-2">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: typeColors.light, 
                color: typeColors.dark 
              }}
            >
              {challenge.challengeType}
            </span>
          </div>
        </div>
      </div>
      
      <EnhancedButton variant="primary" size="sm" fullWidth>
        View Details
      </EnhancedButton>
    </EnhancedCard>
  )
}
```

### Page Layout with Design System

```typescript
import { 
  PageContainer, 
  HeroSection, 
  SectionContainer, 
  GridLayout 
} from '@/src/components/ui/LayoutSystem'

const ChallengesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeroSection background="pattern">
        <PageContainer>
          <h1 className="text-5xl font-bold text-gray-900">
            Available Challenges
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            Choose your transformation journey
          </p>
        </PageContainer>
      </HeroSection>
      
      <SectionContainer 
        title="Featured Programs" 
        subtitle="Our most popular challenges"
      >
        <PageContainer>
          <GridLayout columns={3} gap="lg">
            {/* Challenge cards */}
          </GridLayout>
        </PageContainer>
      </SectionContainer>
    </div>
  )
}
```

## ✅ Best Practices

### 1. Use Design Tokens

❌ **Don't hardcode values:**
```typescript
<div className="text-blue-600 p-4">Content</div>
```

✅ **Use design system:**
```typescript
import { designSystem } from '@/src/lib/design-system'

<div 
  className="p-4"
  style={{ color: designSystem.colors.primary[600] }}
>
  Content
</div>
```

### 2. Leverage Component Variants

❌ **Don't create custom styles:**
```typescript
<button className="bg-blue-500 text-white px-6 py-3 rounded-full">
  Custom Button
</button>
```

✅ **Use component variants:**
```typescript
<EnhancedButton variant="primary" size="md">
  Consistent Button
</EnhancedButton>
```

### 3. Use Layout Components

❌ **Don't create custom layouts:**
```typescript
<div className="container mx-auto max-w-7xl px-8 py-16">
  Content
</div>
```

✅ **Use layout components:**
```typescript
<PageContainer maxWidth="7xl" padding="lg">
  Content
</PageContainer>
```

### 4. Maintain Consistency

- **Always use the same spacing scale** (xs, sm, md, lg, xl)
- **Use consistent border radius** (sm, md, lg, xl, full)
- **Apply the same shadow system** (sm, md, lg, xl, 2xl)
- **Follow typography hierarchy** (xs to 6xl)

## 🔄 Migration Guide

### From Custom Styles to Design System

**Before (Custom):**
```typescript
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

**After (Design System):**
```typescript
<EnhancedCard variant="default" padding="md">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</EnhancedCard>
```

### From Hardcoded Colors to Design Tokens

**Before (Hardcoded):**
```typescript
<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
  Fitness
</span>
```

**After (Design System):**
```typescript
import { designSystem } from '@/src/lib/design-system'

<span 
  className="px-2 py-1 rounded text-sm font-medium"
  style={{
    backgroundColor: designSystem.colors.challengeTypes.fitness.light,
    color: designSystem.colors.challengeTypes.fitness.dark
  }}
>
  Fitness
</span>
```

## 🚀 Getting Started

1. **Import the design system:**
```typescript
import { designSystem, componentStyles, designUtils } from '@/src/lib/design-system'
```

2. **Import components:**
```typescript
import { EnhancedCard, EnhancedButton } from '@/src/components/ui/EnhancedCard'
import { PageContainer, HeroSection } from '@/src/components/ui/LayoutSystem'
```

3. **Start building:**
```typescript
const MyPage = () => (
  <PageContainer>
    <HeroSection background="gradient">
      <h1>Welcome</h1>
    </HeroSection>
    
    <GridLayout columns={3}>
      <EnhancedCard>
        <h3>Card 1</h3>
      </EnhancedCard>
      <EnhancedCard>
        <h3>Card 2</h3>
      </EnhancedCard>
      <EnhancedCard>
        <h3>Card 3</h3>
      </EnhancedCard>
    </GridLayout>
  </PageContainer>
)
```

## 📖 Additional Resources

- **Tailwind CSS Documentation** - For utility classes
- **Figma Design Files** - Visual reference (if available)
- **Component Storybook** - Interactive component examples
- **Accessibility Guidelines** - WCAG compliance standards

---

**Remember:** The design system is here to make your development faster and more consistent. When in doubt, check the design system first before creating custom styles! 🎨✨
