from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import threading

# Replace these with your actual login credentials
username = "XXXXXXXXXX"
password = "XXXXXX"
selected_game = "Ninja School"  # Updated to the game name
login_url = "https://support.teamobi.com/login-game-3.html"

from selenium import webdriver
from selenium.webdriver.firefox.options import Options

from selenium import webdriver
from selenium.webdriver.firefox.options import Options

# Set the path to your geckodriver executable
geckodriver_path = "/usr/local/bin/geckodriver"  # Updated geckodriver path

# Set the path to your Firefox extension (.xpi file)
extension_path = "/home/mackruize/snap/firefox/common/.mozilla/firefox/0noyp1iu.default/extensions/{e58d3966-3d76-4cd9-8552-1582fbc800c1}.xpi"

# Set the extension data directory to the Firefox profile directory
extension_data_dir = "/home/mackruize/snap/firefox/common/.mozilla/firefox/0noyp1iu.default"

# Set up Firefox options
firefox_options = Options()
firefox_options.headless = False  # Change to True if you don't want to see the browser

# Specify the path to the geckodriver executable
firefox_options.binary_location = geckodriver_path

# Set the Firefox profile directly in options
firefox_options.profile = webdriver.FirefoxProfile(extension_data_dir)

# Create a new instance of the Firefox driver with custom profile and options
browser = webdriver.Firefox(options=firefox_options)



symbols = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽']
i = 0
loading_text = ""
stop_loading_event = threading.Event()

def loading_animation():
    global i, loading_text
    while not stop_loading_event.is_set():
        i = (i + 1) % len(symbols)
        loading_text = '\r\033[K%s Loading...' % symbols[i]
        print(loading_text, flush=True, end='')
        time.sleep(0.1)

def main():
    # Start the loading animation in the background
    loading_thread = threading.Thread(target=loading_animation)
    loading_thread.start()
    
        # Navigate to the login page
    browser.get(login_url)
        
        #Logging in

    # Find the username, password, and game input fields
    username_input = browser.find_element(By.ID, "inputEmail")
    password_input = browser.find_element(By.ID, "inputPassword")
    game_select = browser.find_element(By.ID, "game")

    # Enter the credentials
    username_input.send_keys(username)
    password_input.send_keys(password)

    # Select the game
    game_select.send_keys(selected_game)

    # Find the login button and click it
    login_button = browser.find_element(By.XPATH, "//button[@type='submit']")
    login_button.click()

    # Wait for the login to complete (adjust wait time as needed)
    WebDriverWait(browser, 25).until(EC.url_changes(login_url))

    # Check if login was successful based on the URL or page content
    if "login.php" in browser.current_url or "Login failed" in browser.page_source:
        print("\033[31m[Login Failed]\033[0m")
    else:
        print("\033[32m[Logged in!]\033[0m")

        time.sleep(5)

        # Click on "Change Password"
        change_password_link = browser.find_element(By.XPATH, "//a[@href='change-password.html']")
        change_password_link.click()

        # Changing Password
        print("\033[32m[Changing Password]\033[0m")


        # Input values for change password
        email_account_input = browser.find_element(By.NAME, "username")
        username_input = browser.find_element(By.NAME, "ch_username")
        old_password_input = browser.find_element(By.NAME, "old_pass")
        new_password_input = browser.find_element(By.NAME, "new_pass")
        confirm_password_input = browser.find_element(By.NAME, "confirm_pass")

        email_account_input.send_keys("XXXXXXXXXX")
        username_input.send_keys("XXXXXXXXXX")
        old_password_input.send_keys("XXXXXX")
        new_password_input.send_keys("XXXXXX")
        confirm_password_input.send_keys("XXXXXX")

        iframe = browser.find_element(By.XPATH, '/html/body/div[3]/form/div[5]/div/div/div/iframe')
        browser.switch_to.frame(iframe)

        time.sleep(3)

        browser.find_element(By.CLASS_NAME, 'recaptcha-checkbox-border').click()
        browser.implicitly_wait(5)

        # Resolving Captcha
        print("\033[32m[Resolving Captcha]\033[0m")

        browser.switch_to.default_content()
        iframe = browser.find_element(By.XPATH, '//iframe[@title="recaptcha challenge expires in two minutes"]')
        browser.switch_to.frame(iframe)

        time.sleep(6)

        # click to the buster extension button icon on iframe recaptcha challange
        browser.find_element(By.XPATH,'//*[@id="rc-imageselect"]/div[3]/div[2]/div[1]/div[1]/div[4]').click()
        time.sleep(6)

        browser.switch_to.default_content()

        # Wait for the "Change" button to be clickable
        change_button = WebDriverWait(browser, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#button1')))
        change_button.click()

        # Wait for the success message to be present
        success_message = WebDriverWait(browser, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, 'p.lead:nth-child(2)'))
    )

        # Print success message
        print("\033[34m[Password has been changed successfully.]\033[0m")


        # Stop the loading animation
        stop_loading_event.set()
        
        # Close the browser
        browser.quit()

        # Clear the loading text after the loading is complete
        print('\r\033[K', end='')

if __name__ == "__main__":
    main()
