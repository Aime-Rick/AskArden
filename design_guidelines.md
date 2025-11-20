# Ask Arden Chatbot - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern conversational AI interfaces like ChatGPT, Intercom, and Claude, while maintaining a distinctive personality through the logo's friendly, approachable aesthetic. The water droplet mascot suggests fluidity, helpfulness, and clarity—principles that guide the entire interface design.

## Color System
**Primary Palette** (extracted from logo):
- **Primary Blue**: #4A9FD8 (main brand color, bot messages)
- **Light Blue**: #5BB4E5 (accents, hover states)
- **Lime Green**: #A8D84E (user messages, CTAs, active states)
- **Cream/Off-white**: #F8F9FA (background for message bubbles)
- **Neutrals**: #F5F7FA (page background), #E5E8EB (dividers), #6B7280 (secondary text), #1F2937 (primary text)

## Typography
**Font System**: Inter or DM Sans via Google Fonts CDN
- **Chat Messages**: 15px regular (400) for body text
- **Message Timestamps**: 12px regular, text color #6B7280
- **Input Field**: 15px regular
- **Header Title**: 18px semibold (600)
- **Suggested Questions**: 14px medium (500)
- **System Messages**: 13px medium, italic

## Layout & Spacing
**Spacing Scale**: Tailwind units of 2, 3, 4, 6, 8, 12
- Consistent use of p-4 for message padding, gap-3 for message spacing
- Header height: h-16
- Input area height: h-20
- Maximum chat container width: max-w-4xl

## Core Components

### Header
- Fixed top bar with subtle shadow
- Logo positioned left with "Ask Arden" text (18px semibold)
- Optional status indicator (green dot + "Online")
- Background: white with border-b

### Chat Container
- Full viewport height with header and input area subtracted
- Scrollable message area with padding py-6 px-4
- Background: #F5F7FA
- Auto-scroll to latest message

### Message Bubbles
**Bot Messages** (left-aligned):
- Background: white
- Border-left: 3px solid #4A9FD8
- Rounded corners: rounded-lg (left side slightly less rounded)
- Avatar: Small circular image with logo mascot (w-8 h-8)
- Max-width: 75% of container

**User Messages** (right-aligned):
- Background: #A8D84E
- Text color: white
- Rounded corners: rounded-lg (right side slightly less rounded)
- No avatar
- Max-width: 75% of container

**Typing Indicator**:
- Three animated dots in #4A9FD8
- Small bubble matching bot message style
- Animation: gentle bounce effect

### Suggested Questions (Welcome State)
- Display 3-4 question chips when chat is empty
- Background: white with border border-gray-200
- Hover: border-color #5BB4E5
- Layout: Vertical stack with gap-3
- Padding: p-3
- Rounded: rounded-xl
- Icon: Small question mark or sparkle icon left-aligned

### Input Area
- Fixed bottom bar with shadow-lg
- Background: white
- Textarea with auto-resize (max 4 rows)
- Border: 2px border-gray-200, focus ring in #4A9FD8
- Send button: Circular, background #A8D84E, white paper plane icon
- Send button hover: darken to #95C43D
- Padding: p-4

### Additional Elements
**Timestamp**: Display below each message group, text-xs text-gray-500

**System Messages**: Centered, italic text in gray for events like "Conversation started"

**Error States**: Red accent (#EF4444) for failed messages with retry button

**Loading States**: Skeleton loaders matching message bubble shapes

## Interaction Patterns
- Smooth scroll animations when new messages appear
- Input field expands as user types (up to max height)
- Send button disabled state when input empty (opacity-50)
- Suggested questions fade out when conversation begins
- Hover effects: subtle scale (scale-[1.02]) on suggested questions
- Focus states: prominent blue ring on input elements

## Accessibility
- Semantic HTML with proper ARIA labels for chat regions
- Keyboard navigation: Tab to input, Enter to send
- Screen reader announcements for new messages
- High contrast ratios maintained throughout
- Focus indicators on all interactive elements

This design creates a friendly, professional chat experience that mirrors the approachable personality of the Ask Arden logo while maintaining clarity and usability.