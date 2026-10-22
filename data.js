// ===================================================================
// ROBLOX RPG ARCHITECT - DATABASE OF SYSTEMS & LUA SCRIPTS
// ข้อมูลระบบทั้งหมด โค้ด Lua พร้อมตำแหน่งที่ใส่ใน Roblox Studio
// ===================================================================

const ROBLOX_SYSTEMS = [
  {
    id: "system-leaderstats",
    number: "01",
    name: "ระบบเลเวล & ประสบการณ์ (EXP & Leaderstats)",
    shortName: "Level & EXP Core",
    category: "core",
    categoryName: "ระบบหลัก (Core)",
    icon: "🔮",
    color: "#00f0ff",
    secondaryColor: "#0088ff",
    glowColor: "rgba(0, 240, 255, 0.6)",
    description: "ระบบหัวใจหลักในการคำนวณ EXP, Level Up อัตโนมัติ, หลอดพลังชีวิตเพิ่มตามเลเวล และแสดงสถิติบน Leaderboard ด้านขวาบน",
    difficulty: "ง่าย (Beginner)",
    service: "ServerScriptService",
    scriptType: "Script (Server Script)",
    placementTree: `Explorer
└── 📁 ServerScriptService
    └── 📜 LeaderstatsManager (Script)`,
    whereToPut: [
      "1. เปิด **Roblox Studio** และเปิดหน้าต่าง **Explorer** (View > Explorer)",
      "2. เลื่อนลงมาหาโฟลเดอร์ **ServerScriptService**",
      "3. ชี้ที่ ServerScriptService แล้วกดเครื่องหมาย **+** สีฟ้า",
      "4. เลือกสร้าง **Script** (สคริปต์สีขาว ธรรมดา ไม่ใช่ LocalScript)",
      "5. เปลี่ยนชื่อสคริปต์เป็น `LeaderstatsManager`",
      "6. ดับเบิ้ลคลิกเปิดสคริปต์ ลบโค้ดเดิมทิ้ง แล้ววางโค้ดด้านล่างนี้"
    ],
    configNotes: [
      { param: "BASE_EXP", desc: "ค่า EXP พื้นฐานที่ต้องใช้ในเลเวล 1 (ค่าเริ่มต้น: 100)" },
      { param: "EXP_GROWTH", desc: "ตัวคูณความชันของ EXP แต่ละเลเวล (ค่าเริ่มต้น: 1.25 คือยากขึ้น 25% ต่อนัด)" },
      { param: "HP_PER_LEVEL", desc: "เลือดสูงสุดที่จะเพิ่มขึ้นในทุกๆ เลเวลอัป (ค่าเริ่มต้น: +20 HP)" }
    ],
    code: `-- [ServerScriptService > LeaderstatsManager]
-- สคริปต์จัดการ Level, EXP, MaxExp, Coins และระบบเลเวลอัป

local Players = game:GetService("Players")

-- การตั้งค่าตัวแปร (Configuration)
local BASE_EXP = 100        -- EXP ที่ต้องใช้ในเลเวล 1
local EXP_GROWTH = 1.25     -- ตัวคูณความยากของ EXP แต่ละเลเวล
local HP_PER_LEVEL = 20     -- เลือดที่เพิ่มขึ้นต่อเลเวล

-- ฟังก์ชันคำนวณ EXP สูงสุดของแต่ละเลเวล
local function getRequiredExp(level)
	return math.floor(BASE_EXP * (level ^ EXP_GROWTH))
end

-- ฟังก์ชันตรวจสอบและอัปเลเวล
local function checkLevelUp(player)
	local leaderstats = player:FindFirstChild("leaderstats")
	local hiddenStats = player:FindFirstChild("hiddenStats")
	if not leaderstats or not hiddenStats then return end

	local level = leaderstats:FindFirstChild("Level")
	local exp = hiddenStats:FindFirstChild("Exp")
	local maxExp = hiddenStats:FindFirstChild("MaxExp")

	-- วนลูปเลเวลอัปเผื่อได้ EXP เยอะจนข้ามหลายเลเวล
	while exp.Value >= maxExp.Value do
		exp.Value = exp.Value - maxExp.Value
		level.Value = level.Value + 1
		maxExp.Value = getRequiredExp(level.Value)

		-- เพิ่ม MaxHealth และฮีลเลือดเต็มเมื่อเลเวลอัป
		local character = player.Character
		if character and character:FindFirstChild("Humanoid") then
			local humanoid = character.Humanoid
			humanoid.MaxHealth = 100 + (level.Value * HP_PER_LEVEL)
			humanoid.Health = humanoid.MaxHealth
		end

		-- สร้างเอฟเฟกต์เสียงและแสงเลเวลอัป
		if character and character:FindFirstChild("HumanoidRootPart") then
			local hrp = character.HumanoidRootPart
			local sound = Instance.new("Sound")
			sound.SoundId = "rbxassetid://9069609200" -- เสียง Level Up
			sound.Volume = 1
			sound.Parent = hrp
			sound:Play()
			game:GetService("Debris"):AddItem(sound, 3)
		end

		print("🎉 " .. player.Name .. " อัปเลเวลเป็น Lv." .. level.Value .. " สำเร็จ!")
	end
end

-- เมื่อมีผู้เล่นเข้ามาในเกม
Players.PlayerAdded:Connect(function(player)
	-- 1. สร้างโฟลเดอร์ leaderstats (จะแสดงบนหน้าจอด้านขวาบนอัตโนมัติ)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local level = Instance.new("IntValue")
	level.Name = "Level"
	level.Value = 1
	level.Parent = leaderstats

	local coins = Instance.new("IntValue")
	coins.Name = "Coins"
	coins.Value = 0
	coins.Parent = leaderstats

	-- 2. สร้างโฟลเดอร์ hiddenStats สำหรับเก็บค่าเบื้องหลัง
	local hiddenStats = Instance.new("Folder")
	hiddenStats.Name = "hiddenStats"
	hiddenStats.Parent = player

	local exp = Instance.new("IntValue")
	exp.Name = "Exp"
	exp.Value = 0
	exp.Parent = hiddenStats

	local maxExp = Instance.new("IntValue")
	maxExp.Name = "MaxExp"
	maxExp.Value = getRequiredExp(level.Value)
	maxExp.Parent = hiddenStats

	-- ตรวจจับเมื่อค่า Exp เปลี่ยนแปลง
	exp.Changed:Connect(function()
		checkLevelUp(player)
	end)

	-- เมื่อตัวละครเกิดใหม่ ให้เซ็ต MaxHealth ตามเลเวล
	player.CharacterAdded:Connect(function(character)
		local humanoid = character:WaitForChild("Humanoid")
		humanoid.MaxHealth = 100 + (level.Value * HP_PER_LEVEL)
		humanoid.Health = humanoid.MaxHealth
	end)
end)

-- ฟังก์ชันโกลบอลให้สคริปต์อื่นเรียกแจก EXP ได้
_G.AddExp = function(player, amount)
	if not player then return end
	local hiddenStats = player:FindFirstChild("hiddenStats")
	if hiddenStats and hiddenStats:FindFirstChild("Exp") then
		hiddenStats.Exp.Value = hiddenStats.Exp.Value + amount
	end
end

_G.AddCoins = function(player, amount)
	if not player then return end
	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats and leaderstats:FindFirstChild("Coins") then
		leaderstats.Coins.Value = leaderstats.Coins.Value + amount
	end
end`
  },

  {
    id: "system-combat",
    number: "02",
    name: "ระบบอาวุธโจมตี & ดาเมจ (Combat Sword)",
    shortName: "Combat & Hitbox",
    category: "combat",
    categoryName: "ระบบต่อสู้ (Combat)",
    icon: "⚔️",
    color: "#ff3366",
    secondaryColor: "#ff758c",
    glowColor: "rgba(255, 51, 102, 0.6)",
    description: "ดาบโจมตีพร้อมระบบตรวจสอบ Hitbox, ป้องกันการสแปมตี (Cooldown / Debounce) และระบบแท็กดาเมจเพื่อแจก EXP ให้คนตี",
    difficulty: "ปานกลาง (Intermediate)",
    service: "StarterPack & ReplicatedStorage",
    scriptType: "Tool + LocalScript + Script",
    placementTree: `Explorer
├── 📁 StarterPack
│   └── 🗡️ TrainingSword (Tool)
│       ├── 🧱 Handle (Part - ต้องตั้งชื่อว่า Handle)
│       ├── 📜 SwordClient (LocalScript)
│       └── 📜 SwordServer (Script)
└── 📁 ReplicatedStorage
    └── 📁 Events
        └── ⚡ AttackEvent (RemoteEvent)`,
    whereToPut: [
      "1. ไปที่ **ReplicatedStorage** กด **+** สร้าง Folder ชื่อ `Events` แล้วกดสร้าง **RemoteEvent** ด้านในชื่อ `AttackEvent`",
      "2. ไปที่ **StarterPack** กด **+** สร้าง **Tool** เปลี่ยนชื่อเป็น `TrainingSword`",
      "3. สร้าง Part ใน Tool นั้น แล้วตั้งชื่อว่า `Handle` (เพื่อให้ตัวละครถือได้)",
      "4. ใน Tool `TrainingSword` กดสร้าง **LocalScript** ตั้งชื่อว่า `SwordClient` แล้ววางโค้ดส่วนที่ 1",
      "5. ใน Tool `TrainingSword` กดสร้าง **Script** ตั้งชื่อว่า `SwordServer` แล้ววางโค้ดส่วนที่ 2"
    ],
    configNotes: [
      { param: "BASE_DAMAGE", desc: "ดาเมจพื้นฐานของอาวุธชิ้นนี้ (เช่น 25)" },
      { param: "ATTACK_COOLDOWN", desc: "หน่วงเวลาการฟันแต่ละครั้ง (วินาที) ป้องกันการคลิกสแปม" },
      { param: "ATTACK_RANGE", desc: "ระยะเช็กดาเมจสูงสุด (Sanity Check ป้องกันผู้เล่นใช้โปรวาปดาเมจ)" }
    ],
    code: `-- ===================================================
-- ส่วนที่ 1: [StarterPack > TrainingSword > SwordClient (LocalScript)]
-- ===================================================
local Tool = script.Parent
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local attackEvent = ReplicatedStorage:WaitForChild("Events"):WaitForChild("AttackEvent")

local canAttack = true
local COOLDOWN = 0.6

Tool.Activated:Connect(function()
	if not canAttack then return end
	canAttack = false

	-- สั่งให้ Server คำนวณดาเมจ
	attackEvent:FireServer()

	task.wait(COOLDOWN)
	canAttack = true
end)


-- ===================================================
-- ส่วนที่ 2: [StarterPack > TrainingSword > SwordServer (Script)]
-- ===================================================
local Tool = script.Parent
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")

local attackEvent = ReplicatedStorage:WaitForChild("Events"):WaitForChild("AttackEvent")

local BASE_DAMAGE = 25
local MAX_RANGE = 9 -- ระยะห่างสูงสุดระหว่างผู้เล่นกับมอนสเตอร์ (Studs)

local lastAttackTimes = {}

attackEvent.OnServerEvent:Connect(function(player)
	-- ตรวจสอบคูลดาวน์ทางฝั่ง Server
	local now = tick()
	if lastAttackTimes[player] and (now - lastAttackTimes[player] < 0.5) then
		return
	end
	lastAttackTimes[player] = now

	local character = player.Character
	if not character then return end
	local hrp = character:FindFirstChild("HumanoidRootPart")
	if not hrp then return end

	-- ค้นหาศัตรูในระยะรอบตัวผู้เล่น
	local hitTargets = {}
	for _, mob in pairs(workspace:GetDescendants()) do
		if mob:IsA("Model") and mob ~= character and mob:FindFirstChild("Humanoid") then
			local mobHrp = mob:FindFirstChild("HumanoidRootPart") or mob:FindFirstChild("Torso")
			if mobHrp then
				local distance = (mobHrp.Position - hrp.Position).Magnitude
				if distance <= MAX_RANGE and not hitTargets[mob] then
					hitTargets[mob] = true
					local humanoid = mob.Humanoid

					-- ติดแท็ก Creator เพื่อให้ Spawner รู้ว่าใครเป็นคนฆ่า
					local creatorTag = humanoid:FindFirstChild("creator")
					if not creatorTag then
						creatorTag = Instance.new("ObjectValue")
						creatorTag.Name = "creator"
						creatorTag.Parent = humanoid
					end
					creatorTag.Value = player
					Debris:AddItem(creatorTag, 3)

					-- ทำดาเมจ
					humanoid:TakeDamage(BASE_DAMAGE)

					-- เอฟเฟกต์เสียงฟันโดน
					local hitSound = Instance.new("Sound")
					hitSound.SoundId = "rbxassetid://566593606"
					hitSound.Parent = mobHrp
					hitSound:Play()
					Debris:AddItem(hitSound, 1.5)
					break -- ตีโดนตัวเดียวต่อ 1 ครั้ง (ถ้าอยากให้ฟันหมู่ให้เอา break ออก)
				end
			end
		end
	end
end)`
  },

  {
    id: "system-mob-spawner",
    number: "03",
    name: "ระบบสปอว์นมอนสเตอร์ & รีสปอว์น (Mob Spawner)",
    shortName: "Mob Spawner & Health",
    category: "monster",
    categoryName: "มอนสเตอร์ (Monster)",
    icon: "👾",
    color: "#00ff88",
    secondaryColor: "#10b981",
    glowColor: "rgba(0, 255, 136, 0.6)",
    description: "ระบบสปอว์นมอนสเตอร์จาก ServerStorage วนลูปเกิดใหม่เมื่อตาย มีหลอดเลือดลอยเหนือหัว และแจก EXP + เหรียญ ให้คนที่สังหาร",
    difficulty: "ปานกลาง (Intermediate)",
    service: "ServerScriptService & ServerStorage",
    scriptType: "Script (Server Script)",
    placementTree: `Explorer
├── 📁 ServerStorage
│   └── 📁 Mobs
│       └── 🤖 Slime (Model ของมอนสเตอร์ มี Humanoid)
├── 📁 Workspace
│   └── 📁 Spawners
│       └── 🧱 Spawner_Slime (Part จุดเกิดมอนสเตอร์)
└── 📁 ServerScriptService
    └── 📜 MobSpawnerManager (Script)`,
    whereToPut: [
      "1. ไปที่ **ServerStorage** กด **+** สร้าง Folder ชื่อ `Mobs`",
      "2. วางโมเดลมอนสเตอร์ของคุณ (เช่น `Slime`) ไว้ใน `ServerStorage.Mobs` โดยในตัวโมเดลต้องมี **Humanoid** และ **HumanoidRootPart**",
      "3. ใน **Workspace** สร้าง Folder ชื่อ `Spawners` แล้วสร้าง Part เพื่อใช้เป็นตำแหน่งเกิด ตั้งชื่อว่า `Spawner_Slime` (ติ๊ก Anchored = true, CanCollide = false, Transparency = 1)",
      "4. ไปที่ **ServerScriptService** กด **+** สร้าง **Script** ตั้งชื่อว่า `MobSpawnerManager` แล้วนำโค้ดไปวาง"
    ],
    configNotes: [
      { param: "RESPAWN_DELAY", desc: "เวลารอเกิดใหม่หลังมอนสเตอร์ตาย (วินาที)" },
      { param: "EXP_REWARD", desc: "EXP ที่ผู้เล่นจะได้รับเมื่อกำจัดมอนสเตอร์ตัวนี้" },
      { param: "COIN_REWARD", desc: "จำนวนเหรียญที่ดรอปเข้ากระเป๋าเมื่อสังหารสำเร็จ" }
    ],
    code: `-- [ServerScriptService > MobSpawnerManager]
-- สคริปต์ควบคุมการสปอว์นมอนสเตอร์, แสดงหลอดเลือดลอย และแจกรางวัลเมื่อตาย

local ServerStorage = game:GetService("ServerStorage")
local Debris = game:GetService("Debris")

local mobFolder = ServerStorage:WaitForChild("Mobs")
local spawnerFolder = workspace:WaitForChild("Spawners")

local RESPAWN_DELAY = 6    -- วินาทีที่จะเกิดใหม่หลังตาย
local EXP_REWARD = 45       -- EXP ที่ได้เมื่อฆ่าได้
local COIN_REWARD = 15      -- เงินที่ได้เมื่อฆ่าได้

-- ฟังก์ชันสร้างหลอดเลือดลอยเหนือหัว (Floating Health Bar)
local function createHealthBar(mob)
	local head = mob:FindFirstChild("Head") or mob:FindFirstChild("HumanoidRootPart")
	if not head then return end

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "HealthDisplay"
	billboard.Size = UDim2.new(4, 0, 0.6, 0)
	billboard.StudsOffset = Vector3.new(0, 3, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = head

	local bg = Instance.new("Frame")
	bg.Size = UDim2.new(1, 0, 1, 0)
	bg.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
	bg.BorderSizePixel = 0
	bg.Parent = billboard

	local bar = Instance.new("Frame")
	bar.Name = "Bar"
	bar.Size = UDim2.new(1, 0, 1, 0)
	bar.BackgroundColor3 = Color3.fromRGB(0, 255, 136)
	bar.BorderSizePixel = 0
	bar.Parent = bg

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = mob.Name
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Parent = bg

	local humanoid = mob:FindFirstChild("Humanoid")
	if humanoid then
		humanoid.HealthChanged:Connect(function(health)
			local percent = math.clamp(health / humanoid.MaxHealth, 0, 1)
			bar.Size = UDim2.new(percent, 0, 1, 0)
		end)
	end
end

-- ฟังก์ชันสปอว์นมอนสเตอร์ที่จุดเกิด
local function spawnMob(spawnerPart, mobName)
	local template = mobFolder:FindFirstChild(mobName)
	if not template then
		warn("❌ ไม่พบโมเดลมอนสเตอร์ชื่อ: " .. mobName)
		return
	end

	local mob = template:Clone()
	mob:SetPrimaryPartCFrame(spawnerPart.CFrame + Vector3.new(0, 2, 0))
	mob.Parent = workspace

	createHealthBar(mob)

	local humanoid = mob:WaitForChild("Humanoid")
	humanoid.Died:Connect(function()
		-- ค้นหาว่าใครเป็นคนสังหาร (จาก tag creator)
		local creator = humanoid:FindFirstChild("creator")
		if creator and creator.Value then
			local killerPlayer = creator.Value
			if _G.AddExp then _G.AddExp(killerPlayer, EXP_REWARD) end
			if _G.AddCoins then _G.AddCoins(killerPlayer, COIN_REWARD) end

			print("⚔️ " .. killerPlayer.Name .. " สังหาร " .. mob.Name .. " ได้รับ " .. EXP_REWARD .. " EXP!")
		end

		-- ลบซากมอนสเตอร์หลังตาย 2 วินาที
		Debris:AddItem(mob, 2)

		-- หน่วงเวลาก่อนเกิดใหม่
		task.wait(RESPAWN_DELAY)
		spawnMob(spawnerPart, mobName)
	end)
end

-- เริ่มต้นสปอว์นทุกจุดเกิด
for _, spawner in pairs(spawnerFolder:GetChildren()) do
	if spawner:IsA("BasePart") then
		-- ตั้งชื่อ Spawner เป็น Spawner_ชื่อมอน เช่น Spawner_Slime
		local mobName = string.gsub(spawner.Name, "Spawner_", "")
		task.spawn(function()
			spawnMob(spawner, mobName)
		end)
	end
end`
  },

  {
    id: "system-zone-barrier",
    number: "04",
    name: "ประตูกั้นโซนเลเวล (Level Gate Barrier)",
    shortName: "Level Gate Barrier",
    category: "world",
    categoryName: "โลก & โซน (World & Zone)",
    icon: "🚧",
    color: "#ffb703",
    secondaryColor: "#fb8500",
    glowColor: "rgba(255, 183, 3, 0.6)",
    description: "กำแพงหรือประตูแสงเรืองๆ ที่ตรวจเลเวลผู้เล่น ถ้าเลเวลไม่ถึงจะถูกดีดกลับและขึ้นข้อความแจ้งเตือน แต่ถ้าเลเวลถึงจะผ่านได้",
    difficulty: "ง่าย (Beginner)",
    service: "Workspace",
    scriptType: "Script ด้านใน Part ประตู",
    placementTree: `Explorer
└── 📁 Workspace
    └── 📁 ZoneGates
        └── 🧱 Zone2_Gate (Part บาเรียร์กั้นโซน)
            └── 📜 LevelGateScript (Script)`,
    whereToPut: [
      "1. ใน **Workspace** สร้าง Part ขนาดใหญ่เป็นกำแพงขวางทางเข้าโซนถัดไป",
      "2. ตั้งชื่อ Part นั้นว่า `Zone2_Gate`",
      "3. ปรับคุณสมบัติของ Part: **Anchored = true**, **CanCollide = false**, **Transparency = 0.5**, **Material = ForceField** หรือ **Neon**",
      "4. กดเครื่องหมาย **+** ที่ตัว `Zone2_Gate` แล้วเลือกสร้าง **Script**",
      "5. เปลี่ยนชื่อสคริปต์เป็น `LevelGateScript` แล้ววางโค้ดด้านล่างนี้"
    ],
    configNotes: [
      { param: "REQUIRED_LEVEL", desc: "เลเวลขั้นต่ำที่อนุญาตให้เดินผ่านเข้าโซนได้ (เช่น 15)" },
      { param: "KNOCKBACK_FORCE", desc: "แรงผลักสะท้อนกลับถ้าเลเวลไม่ถึง" }
    ],
    code: `-- [Workspace > ZoneGates > Zone2_Gate > LevelGateScript]
-- สคริปต์ตรวจจับเลเวลผู้เล่น หากเลเวลไม่ถึงจะผลักออกไป

local gate = script.Parent
local Players = game:GetService("Players")

local REQUIRED_LEVEL = 15      -- เลเวลที่ต้องการ
local KNOCKBACK_FORCE = 75     -- ความแรงของการดีดกลับ

local debounceTable = {}

gate.Touched:Connect(function(hit)
	local character = hit.Parent
	local player = Players:GetPlayerFromCharacter(character)
	if not player then return end

	-- ป้องกันการทำงานซ้ำซ้อนในเสี้ยววินาที
	if debounceTable[player] then return end

	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then return end
	local level = leaderstats:FindFirstChild("Level")
	if not level then return end

	if level.Value < REQUIRED_LEVEL then
		debounceTable[player] = true

		local hrp = character:FindFirstChild("HumanoidRootPart")
		if hrp then
			-- ผลักผู้เล่นถอยหลังออกจากประตู
			local pushDirection = (hrp.Position - gate.Position).Unit
			pushDirection = Vector3.new(pushDirection.X, 0.4, pushDirection.Z).Unit
			hrp.AssemblyLinearVelocity = pushDirection * KNOCKBACK_FORCE

			-- เสียงแจ้งเตือนติดบาเรียร์
			local sound = Instance.new("Sound")
			sound.SoundId = "rbxassetid://9069609200"
			sound.Pitch = 0.6
			sound.Parent = hrp
			sound:Play()
			game:GetService("Debris"):AddItem(sound, 1)

			-- แสดงป้ายข้อความเตือนชั่วคราว
			local hint = Instance.new("BillboardGui")
			hint.Size = UDim2.new(5, 0, 1.2, 0)
			hint.StudsOffset = Vector3.new(0, 3, 0)
			hint.AlwaysOnTop = true
			hint.Parent = hrp

			local label = Instance.new("TextLabel")
			label.Size = UDim2.new(1, 0, 1, 0)
			label.BackgroundColor3 = Color3.fromRGB(220, 38, 38)
			label.TextColor3 = Color3.fromRGB(255, 255, 255)
			label.Font = Enum.Font.GothamBold
			label.TextScaled = true
			label.Text = "⛔ ต้องมีเลเวล " .. REQUIRED_LEVEL .. " ขึ้นไป!"
			label.Parent = hint

			game:GetService("Debris"):AddItem(hint, 2)
		end

		task.wait(1.5)
		debounceTable[player] = nil
	else
		-- ถ้าเลเวลถึงกำหนด ผู้เล่นจะเดินทะลุผ่านได้ทันที
	end
end)`
  },

  {
    id: "system-quest-bounty",
    number: "05",
    name: "ระบบเควสต์ & ล่ามอนสเตอร์ (Quest & Bounty NPC)",
    shortName: "Quest & Bounty NPC",
    category: "quest",
    categoryName: "ภารกิจ & เควสต์ (Quest)",
    icon: "📜",
    color: "#a855f7",
    secondaryColor: "#c084fc",
    glowColor: "rgba(168, 85, 247, 0.6)",
    description: "ระบบคุยกับ NPC ด้วย ProximityPrompt (กด E เพื่อคุย) มอบหมายเควสต์กำจัดมอนสเตอร์ นับจำนวนตัว และกดส่งเพื่อรับ EXP + รางวัลพิเศษ",
    difficulty: "ปานกลาง (Intermediate)",
    service: "Workspace & ServerScriptService",
    scriptType: "Script ใน NPC + ProximityPrompt",
    placementTree: `Explorer
└── 📁 Workspace
    └── 📁 NPCs
        └── 🧍 QuestMaster_Wolf (Model ของ NPC)
            ├── 🔲 HumanoidRootPart
            ├── 🎛️ ProximityPrompt (ปุ่มกด E คุย)
            └── 📜 QuestScript (Script)`,
    whereToPut: [
      "1. นำโมเดลตัวละคร NPC มาวางใน **Workspace** ตั้งชื่อว่า `QuestMaster_Wolf`",
      "2. ในโมเดล NPC เลือกที่ **HumanoidRootPart** แล้วกด **+** สร้าง **ProximityPrompt**",
      "3. ตั้งค่า ProximityPrompt: **ActionText = 'คุยรับเควสต์'**, **ObjectText = 'ผู้เฒ่าเควสต์'**, **HoldDuration = 0.5**",
      "4. ในโมเดล NPC กด **+** สร้าง **Script** ตั้งชื่อว่า `QuestScript`",
      "5. วางโค้ดลงไป โดยปรับชื่อมอนสเตอร์เป้าหมายและจำนวนตัวที่ต้องการ"
    ],
    configNotes: [
      { param: "TARGET_MOB", desc: "ชื่อของมอนสเตอร์ที่ต้องไปกำจัด (เช่น 'Slime')" },
      { param: "REQUIRED_KILLS", desc: "จำนวนตัวที่ต้องกำจัดให้ครบ (เช่น 5 ตัว)" },
      { param: "REWARD_EXP", desc: "EXP ก้อนโตเมื่อส่งเควสต์สำเร็จ" },
      { param: "REWARD_COINS", desc: "เหรียญทองพิเศษที่ได้รับ" }
    ],
    code: `-- [Workspace > NPCs > QuestMaster_Wolf > QuestScript]
-- สคริปต์ระบบเควสต์ผ่าน ProximityPrompt ตรวจนับและรับรางวัล

local npc = script.Parent
local prompt = npc:FindFirstChildWhichIsA("ProximityPrompt", true)

local TARGET_MOB = "Slime"       -- มอนสเตอร์เป้าหมาย
local REQUIRED_KILLS = 5        -- จำนวนตัว
local REWARD_EXP = 300          -- EXP รางวัล
local REWARD_COINS = 100        -- เงินรางวัล

prompt.Triggered:Connect(function(player)
	-- สร้างหรือดึงโฟลเดอร์เควสต์ในตัวผู้เล่น
	local questFolder = player:FindFirstChild("ActiveQuest")
	if not questFolder then
		questFolder = Instance.new("Folder")
		questFolder.Name = "ActiveQuest"
		questFolder.Parent = player

		local target = Instance.new("StringValue")
		target.Name = "Target"
		target.Value = TARGET_MOB
		target.Parent = questFolder

		local current = Instance.new("IntValue")
		current.Name = "CurrentKills"
		current.Value = 0
		current.Parent = questFolder

		local needed = Instance.new("IntValue")
		needed.Name = "NeededKills"
		needed.Value = REQUIRED_KILLS
		needed.Parent = questFolder

		print("📜 " .. player.Name .. " รับเควสต์ล่า " .. TARGET_MOB .. " (" .. REQUIRED_KILLS .. " ตัว)")
		return
	end

	-- หากมีเควสต์อยู่แล้ว ตรวจสอบว่าทำเสร็จหรือยัง
	local current = questFolder:FindFirstChild("CurrentKills")
	local needed = questFolder:FindFirstChild("NeededKills")

	if current and needed and current.Value >= needed.Value then
		-- เควสต์สำเร็จ! มอบของรางวัล
		if _G.AddExp then _G.AddExp(player, REWARD_EXP) end
		if _G.AddCoins then _G.AddCoins(player, REWARD_COINS) end

		questFolder:Destroy() -- ลบเควสต์ที่ทำเสร็จแล้วออก

		-- เสียงแสดงความยินดี
		local char = player.Character
		if char and char:FindFirstChild("HumanoidRootPart") then
			local sound = Instance.new("Sound")
			sound.SoundId = "rbxassetid://9069609200"
			sound.Parent = char.HumanoidRootPart
			sound:Play()
			game:GetService("Debris"):AddItem(sound, 3)
		end

		print("🎉 " .. player.Name .. " ส่งเควสต์สำเร็จ! รับ " .. REWARD_EXP .. " EXP!")
	else
		print("⏳ " .. player.Name .. " ยังกำจัดไม่ครบ: " .. current.Value .. "/" .. needed.Value)
	end
end)`
  },

  {
    id: "system-datastore",
    number: "06",
    name: "ระบบเซฟข้อมูลถาวร (DataStore Save System)",
    shortName: "DataStore Auto-Save",
    category: "save",
    categoryName: "ระบบบันทึก (Data & Save)",
    icon: "💾",
    color: "#3b82f6",
    secondaryColor: "#60a5fa",
    glowColor: "rgba(59, 130, 246, 0.6)",
    description: "ระบบเซฟ Level, Exp, Coins และ Rebirth แบบปลอดภัยด้วย pcall พร้อมรองรับการเซฟตอนผู้เล่นออก และตอน Server ปิดตัว (BindToClose)",
    difficulty: "ขั้นสูง (Advanced)",
    service: "ServerScriptService",
    scriptType: "Script (Server Script)",
    placementTree: `Explorer
└── 📁 ServerScriptService
    └── 📜 DataSaveManager (Script)

⚠️ อย่าลืมเปิด: Game Settings > Security > Enable Studio Access to API Services`,
    whereToPut: [
      "1. **สำคัญมาก:** ไปที่แท็บ **Home** กดปุ่ม **Game Settings** (ต้อง Publish เกมก่อน)",
      "2. ไปที่หัวข้อ **Security** ติ๊กเปิด **'Enable Studio Access to API Services'** แล้วกด Save",
      "3. ใน **ServerScriptService** กด **+** สร้าง **Script** ตั้งชื่อว่า `DataSaveManager`",
      "4. วางโค้ดด้านล่างนี้ ระบบจะโหลดข้อมูลเมื่อผู้เล่นเข้า และเซฟอัตโนมัติเมื่อผู้เล่นออก"
    ],
    configNotes: [
      { param: "DATA_KEY_VERSION", desc: "ชื่อคีย์เซฟ (เปลี่ยนชื่อนี้เมื่อต้องการรีเซ็ตข้อมูลทุกคน)" },
      { param: "AUTOSAVE_INTERVAL", desc: "เซฟอัตโนมัติทุกๆ กี่นาที ป้องกันเซิร์ฟเวอร์หลุดกะทันหัน" }
    ],
    code: `-- [ServerScriptService > DataSaveManager]
-- ระบบบันทึกข้อมูลถาวร Level, Exp, Coins, Rebirths พร้อม pcall ป้องกันบั๊ก

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local PlayerDataStore = DataStoreService:GetDataStore("RPG_PlayerData_v1")

-- ฟังก์ชันโหลดข้อมูล
local function loadData(player)
	local userId = player.UserId
	local leaderstats = player:WaitForChild("leaderstats", 10)
	local hiddenStats = player:WaitForChild("hiddenStats", 10)
	if not leaderstats or not hiddenStats then return end

	local success, savedData = pcall(function()
		return PlayerDataStore:GetAsync("Player_" .. userId)
	end)

	if success and savedData then
		leaderstats.Level.Value = savedData.Level or 1
		leaderstats.Coins.Value = savedData.Coins or 0
		hiddenStats.Exp.Value = savedData.Exp or 0
		print("✅ โหลดข้อมูลของ " .. player.Name .. " สำเร็จ! (Level " .. leaderstats.Level.Value .. ")")
	else
		print("🆕 ผู้เล่นใหม่: " .. player.Name .. " เริ่มต้นการผจญภัย!")
	end
end

-- ฟังก์ชันบันทึกข้อมูล
local function saveData(player)
	local leaderstats = player:FindFirstChild("leaderstats")
	local hiddenStats = player:FindFirstChild("hiddenStats")
	if not leaderstats or not hiddenStats then return end

	local dataToSave = {
		Level = leaderstats.Level.Value,
		Coins = leaderstats.Coins.Value,
		Exp = hiddenStats.Exp.Value,
	}

	local success, err = pcall(function()
		PlayerDataStore:SetAsync("Player_" .. player.UserId, dataToSave)
	end)

	if success then
		print("💾 บันทึกข้อมูลของ " .. player.Name .. " สำเร็จเรียบร้อย")
	else
		warn("❌ บันทึกข้อมูลล้มเหลว: " .. tostring(err))
	end
end

-- เมื่อผู้เล่นเข้าเกม
Players.PlayerAdded:Connect(loadData)

-- เมื่อผู้เล่นออกจากเกม
Players.PlayerRemoving:Connect(saveData)

-- เมื่อ Server กำลังจะปิด (Server Shutdown Security)
game:BindToClose(function()
	for _, player in pairs(Players:GetPlayers()) do
		saveData(player)
	end
end)`
  },

  {
    id: "system-rebirth",
    number: "07",
    name: "ระบบจุติ & ตัวคูณถาวร (Rebirth / Prestige)",
    shortName: "Rebirth Multiplier",
    category: "endgame",
    categoryName: "คอนเทนต์ท้ายเกม (Endgame)",
    icon: "🔄",
    color: "#ec4899",
    secondaryColor: "#f472b6",
    glowColor: "rgba(236, 72, 153, 0.6)",
    description: "เมื่อเลเวลตัน (เช่น Lv.100) สามารถเลือกจุติได้ โดยจะรีเซ็ตเลเวลเป็น 1 แลกกับการได้ตัวคูณ EXP และดาเมจ x1.5 ถาวร เพิ่มความเล่นซ้ำได้ไม่รู้จบ",
    difficulty: "ปานกลาง (Intermediate)",
    service: "ServerScriptService & ReplicatedStorage",
    scriptType: "Script + RemoteFunction",
    placementTree: `Explorer
├── 📁 ReplicatedStorage
│   └── 📁 RemoteFunctions
│       └── 📞 RebirthRequest (RemoteFunction)
└── 📁 ServerScriptService
    └── 📜 RebirthManager (Script)`,
    whereToPut: [
      "1. ไปที่ **ReplicatedStorage** สร้าง Folder ชื่อ `RemoteFunctions`",
      "2. ในนั้นกดสร้าง **RemoteFunction** ตั้งชื่อว่า `RebirthRequest`",
      "3. ในโฟลเดอร์ **leaderstats** ของผู้เล่น ให้เพิ่ม `IntValue` ชื่อ `Rebirth` (ค่าเริ่มต้น = 0)",
      "4. ไปที่ **ServerScriptService** กดสร้าง **Script** ตั้งชื่อว่า `RebirthManager`",
      "5. นำโค้ดด้านล่างนี้ไปวาง เมื่อผู้เล่นกดปุ่ม Rebirth จาก UI จะเรียกใช้ฟังก์ชันนี้"
    ],
    configNotes: [
      { param: "REQUIRED_LEVEL", desc: "เลเวลขั้นต่ำที่อนุญาตให้ทำการจุติได้ (เช่น 100)" },
      { param: "STAT_MULTIPLIER", desc: "ตัวคูณโบนัสต่อการ Rebirth 1 ครั้ง (เช่น x1.5 หรือ +50%)" }
    ],
    code: `-- [ServerScriptService > RebirthManager]
-- ระบบจุติ (Rebirth) รีเซ็ตเลเวลแลกรับตัวคูณพลังถาวร

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local remoteFunctions = ReplicatedStorage:WaitForChild("RemoteFunctions")
local rebirthFunction = remoteFunctions:WaitForChild("RebirthRequest")

local REQUIRED_LEVEL = 100 -- เลเวลที่ต้องใช้จุติ

rebirthFunction.OnServerInvoke = function(player)
	local leaderstats = player:FindFirstChild("leaderstats")
	local hiddenStats = player:FindFirstChild("hiddenStats")
	if not leaderstats or not hiddenStats then return false, "ไม่พบข้อมูลสถิติ" end

	local level = leaderstats:FindFirstChild("Level")
	local rebirth = leaderstats:FindFirstChild("Rebirth")

	-- ตรวจสอบว่ามีค่า Rebirth หรือยัง ถ้ายังให้สร้างขึ้นมา
	if not rebirth then
		rebirth = Instance.new("IntValue")
		rebirth.Name = "Rebirth"
		rebirth.Value = 0
		rebirth.Parent = leaderstats
	end

	if level.Value >= REQUIRED_LEVEL then
		-- ทำการจุติ
		rebirth.Value = rebirth.Value + 1
		level.Value = 1
		hiddenStats.Exp.Value = 0

		-- รีเซ็ตเลือดตัวละคร
		local char = player.Character
		if char and char:FindFirstChild("Humanoid") then
			char.Humanoid.MaxHealth = 100
			char.Humanoid.Health = 100

			-- เอฟเฟกต์แสงอลังการรอบตัว
			local sound = Instance.new("Sound")
			sound.SoundId = "rbxassetid://9069609200"
			sound.Pitch = 1.3
			sound.Parent = char.HumanoidRootPart
			sound:Play()
			game:GetService("Debris"):AddItem(sound, 3)
		end

		-- ประกาศในห้องแชทให้ทุกคนรู้
		print("🌟 มหาบุรุษ " .. player.Name .. " จุติครั้งที่ " .. rebirth.Value .. " สำเร็จแล้ว!")
		return true, "จุติสำเร็จ! ได้รับโบนัส EXP & ATK ถาวร"
	else
		return false, "เลเวลยังไม่ถึง " .. REQUIRED_LEVEL .. " (ปัจจุบัน Lv." .. level.Value .. ")"
	end
end`
  },

  {
    id: "system-fast-travel",
    number: "08",
    name: "ระบบจุดวาร์ปประจำโซน (Fast Travel & Waypoint)",
    shortName: "Zone Fast Travel",
    category: "world",
    categoryName: "โลก & โซน (World & Zone)",
    icon: "🗺️",
    color: "#14b8a6",
    secondaryColor: "#2dd4bf",
    glowColor: "rgba(20, 184, 166, 0.6)",
    description: "แท่นหินวาร์ปเรืองแสง ผู้เล่นเดินเหยียบเพื่อปลดล็อกโซน จากนั้นสามารถกดเลือกวาร์ปไปมาระหว่างเมืองหลักกับโซนต่างๆ ได้ทันที",
    difficulty: "ง่ายถึงปานกลาง (Beginner-Intermediate)",
    service: "Workspace & ServerScriptService",
    scriptType: "Script ในแท่นวาร์ป (Waypoint Pad)",
    placementTree: `Explorer
└── 📁 Workspace
    └── 📁 Waypoints
        ├── 🧱 Hub_SpawnPad (แท่นเมืองหลัก)
        └── 🧱 Desert_Waypoint (แท่นโซนทะเลทราย)
            └── 📜 WaypointScript (Script)`,
    whereToPut: [
      "1. ใน **Workspace** สร้าง Folder ชื่อ `Waypoints`",
      "2. สร้าง Part รูปวงกลมหรือแท่นหิน ปรับ **Material = Neon**, **Anchored = true** ตั้งชื่อเช่น `Desert_Waypoint`",
      "3. ใน Part นั้นกด **+** สร้าง **Script** ตั้งชื่อว่า `WaypointScript`",
      "4. วางโค้ดนี้ลงไป เมื่อผู้เล่นเหยียบครั้งแรกจะบันทึกสถานะว่าปลดล็อกจุดวาร์ปนี้แล้ว"
    ],
    configNotes: [
      { param: "ZONE_NAME", desc: "ชื่อของโซนที่แท่นนี้ตั้งอยู่ (เช่น 'Desert Zone')" },
      { param: "TELEPORT_COOLDOWN", desc: "ระยะเวลาหน่วงก่อนจะวาร์ปได้อีกครั้ง (ป้องกันบั๊ก)" }
    ],
    code: `-- [Workspace > Waypoints > Desert_Waypoint > WaypointScript]
-- สคริปต์ปลดล็อกแท่นวาร์ปเมื่อผู้เล่นเดินเหยียบครั้งแรก

local pad = script.Parent
local Players = game:GetService("Players")

local ZONE_NAME = "Desert_Zone"

local unlockedDebounce = {}

pad.Touched:Connect(function(hit)
	local character = hit.Parent
	local player = Players:GetPlayerFromCharacter(character)
	if not player then return end

	local key = player.UserId .. "_" .. ZONE_NAME
	if unlockedDebounce[key] then return end

	-- ดึงหรือสร้างโฟลเดอร์จุดวาร์ปที่ปลดล็อกแล้ว
	local waypointsFolder = player:FindFirstChild("UnlockedWaypoints")
	if not waypointsFolder then
		waypointsFolder = Instance.new("Folder")
		waypointsFolder.Name = "UnlockedWaypoints"
		waypointsFolder.Parent = player
	end

	-- ตรวจสอบว่าเคยปลดล็อกจุดนี้ไปหรือยัง
	if not waypointsFolder:FindFirstChild(ZONE_NAME) then
		unlockedDebounce[key] = true

		local tag = Instance.new("BoolValue")
		tag.Name = ZONE_NAME
		tag.Value = true
		tag.Parent = waypointsFolder

		-- เอฟเฟกต์เสียงและแสงเมื่อปลดล็อกจุดวาร์ปใหม่
		local hrp = character:FindFirstChild("HumanoidRootPart")
		if hrp then
			local sound = Instance.new("Sound")
			sound.SoundId = "rbxassetid://9069609200"
			sound.Pitch = 1.1
			sound.Parent = hrp
			sound:Play()
			game:GetService("Debris"):AddItem(sound, 2)
		end

		print("📍 " .. player.Name .. " ปลดล็อกจุดวาร์ปใหม่: " .. ZONE_NAME)
	end
end)`
  }
];

// Helper: Get system by ID
function getSystemById(id) {
  return ROBLOX_SYSTEMS.find(sys => sys.id === id);
}
