# My Profile Feature Implementation 

## Overview
This document outlines the complete implementation of the "My Profile" feature for the Mindoora application, including backend API endpoints, database schema updates, and comprehensive test coverage.

## Database Schema Changes

### User Table Updates
Added the following profile fields to the `User` table:
- `bio` (text) - User biography/description
- `location` (varchar) - User's location
- `website` (varchar) - User's personal website URL
- `twitter` (varchar) - Twitter handle (without @)
- `instagram` (varchar) - Instagram handle (without @)
- `linkedin` (varchar) - LinkedIn profile URL

### Migration Applied
```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "website" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitter" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "instagram" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedin" varchar;
```

## API Endpoints

### 1. GET /api/v1/user/profile
**Description**: Retrieve complete user profile information

**Authentication**: Required (JWT Bearer token)

**Response Format**:
```json
{
  "message": "Profile retrieved successfully",
  "profile": {
    "id": "user-register-id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+1234567890",
    "avatar": "avatar-image-url",
    "bio": "User biography",
    "location": "City, Country",
    "website": "https://website.com",
    "socialMedia": {
      "twitter": "twitterhandle",
      "instagram": "instagramhandle",
      "linkedin": "linkedin-profile-url"
    },
    "trophies": [],
    "totalScore": 1250,
    "verified": true,
    "memberSince": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. PUT /api/v1/user/profile
**Description**: Update user profile information

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "name": "Updated Name",
  "bio": "Updated biography",
  "location": "Updated location",
  "website": "https://updated-website.com",
  "twitter": "updatedhandle",
  "instagram": "updatedhandle",
  "linkedin": "updated-linkedin-url"
}
```

**Validation**:
- `name` is required and cannot be empty
- Social media handles are automatically sanitized (@ symbols removed)
- All other fields are optional

**Response**: Same format as GET endpoint with updated data

### 3. PUT /api/v1/user/profile/avatar
**Description**: Update user avatar/profile image

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "imageUrl": "new-avatar-url.png"
}
```

**Response**:
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "avatar": "new-avatar-url.png"
  }
}
```

## File Structure

### Controllers
- `controllers/user/profile.controller.ts` - Profile-specific business logic

### Routes
- Updated `routes/user.router.ts` to include profile endpoints

### Tests
- `test/userProfile.test.ts` - Comprehensive test suite

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Input Sanitization**: Social media handles are automatically cleaned
3. **Data Validation**: Required fields are validated before database operations
4. **SQL Injection Protection**: Parameterized queries are used throughout

## Data Integration

The profile endpoints integrate data from multiple tables:
- **Register table**: Authentication info (email, phone, verified status)
- **User table**: Profile info (name, bio, social media, etc.)
- **UserTrophies table**: Trophy count calculation
- **userGameScore table**: Total score calculation across all games

## Error Handling

### Common Error Responses:
- `401`: No authentication token provided
- `403`: Invalid or expired token
- `404`: User profile not found
- `400`: Validation errors (e.g., missing required fields)
- `500`: Internal server errors

## Testing

### Test Coverage Includes:
1. **Profile Retrieval**:
   - Successful profile fetch
   - Authentication validation
   - Token verification

2. **Profile Updates**:
   - Successful profile updates
   - Field validation (required name)
   - Social media handle sanitization

3. **Avatar Updates**:
   - Successful avatar changes
   - Missing parameter validation

### Running Tests
```bash
npm test test/userProfile.test.ts
```

## Mobile App Integration

The backend endpoints are designed to work seamlessly with the existing React Native profile screen (`src/screens/profile/UserProfileScreen.tsx`) in the mobile app. The response format matches the expected data structure used by the mobile UI components.

## Caching

Profile data is cached for 1 hour (3600 seconds) using HTTP cache headers to improve performance and reduce database load.

## Future Enhancements

1. **Image Upload**: Direct image upload endpoint for avatars
2. **Profile Visibility**: Privacy settings for profile fields
3. **Activity Feed**: Integration with user activity and achievements
4. **Profile Verification**: Enhanced verification system for profiles
5. **Search Integration**: Make profiles searchable by bio/location

## Deployment Notes

1. Run database migration to add new columns
2. Deploy updated backend code
3. Update mobile app to use new API endpoints
4. Test authentication flow end-to-end

This implementation provides a robust, secure, and scalable foundation for the "My Profile" feature in the Mindoora application.
