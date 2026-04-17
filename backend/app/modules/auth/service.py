from app.core.security import verify_password, create_token
from app.modules.auth.model import User

def login_user(db, email, password):
    print("=== DÉBUT LOGIN ===")
    print(f"1. Email recherché: '{email}'")
    print(f"2. Mot de passe reçu: '{password}'")
    print(f"3. Type du mot de passe: {type(password)}")
    
    user = db.query(User).filter(User.email == email).first()
    
    print(f"4. User trouvé: {user}")
    
    if not user:
        print("❌ USER NOT FOUND")
        return None
    
    print(f"5. Email en DB: '{user.email}'")
    print(f"6. Password en DB: '{user.password}'")
    print(f"7. Type password DB: {type(user.password)}")
    print(f"8. Comparaison directe: {user.password == password}")
    
    # Essayons les deux méthodes
    if user.password == password:
        print("✅ Match par comparaison directe")
        return {
            "token": create_token(data={"sub": user.email, "role": user.role}),
            "role": user.role
        }
    
    # Si ça ne marche pas, vérifions les espaces cachés
    print(f"9. Longueur password input: {len(password)}")
    print(f"10. Longueur password DB: {len(user.password)}")
    print(f"11. Représentation hex input: {password.encode('utf-8').hex()}")
    print(f"12. Représentation hex DB: {user.password.encode('utf-8').hex()}")
    
    print("❌ PASSWORD WRONG")
    return None